// 직접 경로 사용 — `@/shared` barrel은 React 컴포넌트까지 끌어와 viewer 청크 분리를 깨뜨림.
import { getTranslate } from '@/shared/utils/i18n';
import { Plugin, PluginKey, type EditorState } from '@tiptap/pm/state';
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view';

/**
 * 업로드 중 임시 상태(blob 미리보기, 진행률, 에러)를 공유 문서(노드 attr)에 넣지 않고
 * 로컬 전용 decoration으로 표시하기 위한 플러그인.
 *
 * 협업(Yjs) 환경에서 blob: URL이나 진행률 attr이 문서에 들어가면 다른 피어에게
 * 깨진 이미지/불필요한 노드 교체가 동기화되므로, 실제 이미지 노드는
 * 업로드 완료 후 최종 URL로 1회만 삽입한다. (TipTap 공식 협업 업로드 패턴)
 *
 * 위치는 decoration mapping이 아니라 플러그인 상태(uploads)의 pos를 매 트랜잭션마다
 * 매핑해 추적한다. y-prosemirror가 원격 변경을 노드 교체로 적용하면 교체 범위 안의
 * widget decoration이 통째로 떨어져 나가는데, 이때도 매핑된 위치에 다시 그린다(부활).
 */

interface UploadEntry {
  /** 로컬 미리보기용 blob: URL — decoration DOM에서만 사용되고 문서에는 절대 들어가지 않음 */
  previewUrl: string;
  fileName: string;
  progress: number;
  error: boolean;
  /** 현재 placeholder 위치. 매 트랜잭션마다 tr.mapping으로 갱신 */
  pos: number;
}

interface PluginState {
  set: DecorationSet;
  /** uploadId → 진행 중 업로드. 플러그인 인스턴스(에디터)별로 격리됨 */
  uploads: Map<string, UploadEntry>;
}

interface PlaceholderMeta {
  /** uploads 엔트리 삭제 + decoration 제거 */
  remove?: { id: string };
  /** decoration을 제거만 — 부활 로직이 현재 상태(에러 등)로 다시 그림 */
  redraw?: { id: string };
}

export const imageUploadPlaceholderKey = new PluginKey<PluginState>('imageUploadPlaceholder');

/** uploadId → 진행률 텍스트 요소. 트랜잭션 없이 DOM에서 직접 갱신 (uuid라 에디터 간 충돌 없음) */
const progressEls = new Map<string, HTMLElement>();

const LOADER_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>';

const IMAGE_OFF_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="2" x2="22" y1="2" y2="22"/><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"/><line x1="13.5" x2="6" y1="13.5" y2="21"/><line x1="18" x2="21" y1="12" y2="15"/><path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59"/><path d="M21 15V5a2 2 0 0 0-2-2H9"/></svg>';

const X_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

/** 정적 SVG 마크업으로 아이콘 요소 생성 (사용자 입력 없음) */
function createIcon(svgMarkup: string, className: string): HTMLElement {
  const holder = document.createElement('span');
  holder.innerHTML = svgMarkup;
  const svg = holder.firstElementChild as HTMLElement;
  svg.setAttribute('class', className);
  return svg;
}

/** 업로드 중: blob 미리보기 + 진행률 배지 (ImageNodeView의 업로드 오버레이와 동일한 스타일) */
function renderUploadingDOM(id: string, entry: UploadEntry): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'we:relative we:w-full';
  wrapper.contentEditable = 'false';
  wrapper.dataset.imageUploadPlaceholder = id;

  const img = document.createElement('img');
  img.src = entry.previewUrl;
  img.alt = entry.fileName;
  img.draggable = false;
  img.className = 'we:mb-0 we:block we:h-auto we:w-full we:max-w-full we:rounded we:shadow-md we:mt-0';
  wrapper.appendChild(img);

  const badge = document.createElement('div');
  badge.className =
    'we:absolute we:right-2 we:bottom-2 we:flex we:h-5 we:items-center we:justify-center we:gap-1 we:rounded-[2px] we:px-1 we:bg-elevation-opacity-2 we:text-text-inverse';
  badge.appendChild(createIcon(LOADER_SVG, 'we:h-3.5 we:w-3.5 we:animate-spin'));

  const progressText = document.createElement('span');
  progressText.className = 'we:text-xs we:font-medium we:text-text-inverse';
  progressText.textContent = `Uploading ${entry.progress}%`;
  badge.appendChild(progressText);
  wrapper.appendChild(badge);

  progressEls.set(id, progressText);
  return wrapper;
}

/** 업로드 실패: ImageErrorBlock(inline)과 동일한 스타일의 에러 블록 + 제거 버튼 (로컬 전용) */
function renderErrorDOM(view: EditorView, id: string, entry: UploadEntry): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className =
    'we:mt-4 we:flex we:items-center we:gap-3 we:rounded-[5px] we:bg-elevation-level2 we:p-3 we:min-w-[412px] we:max-w-[412px] we:w-fit we:box-border';
  wrapper.contentEditable = 'false';
  wrapper.dataset.imageUploadPlaceholder = id;

  wrapper.appendChild(createIcon(IMAGE_OFF_SVG, 'we:h-5 we:w-5 we:shrink-0 we:text-text-light'));

  const textWrap = document.createElement('div');
  textWrap.className = 'we:min-w-0 we:flex-1 we:flex we:gap-2 we:items-center';

  const mainText = document.createElement('p');
  mainText.className = 'we:text-[14px]! we:mt-0! we:text-text-sub! we:text-start! we:break-words! we:select-none!';
  mainText.textContent = getTranslate('이미지를 업로드 할 수 없습니다');
  textWrap.appendChild(mainText);

  if (entry.fileName) {
    const fileText = document.createElement('p');
    fileText.className = 'we:text-text-light! we:text-[12px]! we:mt-0! we:select-none! we:truncate! we:max-w-[150px]!';
    fileText.textContent = entry.fileName;
    textWrap.appendChild(fileText);
  }
  wrapper.appendChild(textWrap);

  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.setAttribute('aria-label', 'Remove');
  removeButton.style.cssText =
    'display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;background:none;border:0;padding:4px;cursor:pointer;';
  removeButton.appendChild(createIcon(X_SVG, 'we:h-5 we:w-5 we:text-text-light'));
  removeButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    removeImageUploadPlaceholder(view, id);
  });
  wrapper.appendChild(removeButton);

  return wrapper;
}

function renderPlaceholderDOM(view: EditorView, id: string): HTMLElement {
  const entry = imageUploadPlaceholderKey.getState(view.state)?.uploads.get(id);
  if (!entry) {
    return document.createElement('span');
  }
  return entry.error ? renderErrorDOM(view, id, entry) : renderUploadingDOM(id, entry);
}

function createPlaceholderDecoration(id: string, pos: number): Decoration {
  return Decoration.widget(pos, (view) => renderPlaceholderDOM(view, id), {
    id,
    side: 0,
    // 위젯 내부 이벤트(에러 블록 X 버튼 등)는 에디터가 처리하지 않음
    stopEvent: () => true,
  });
}

export function imageUploadPlaceholderPlugin(): Plugin<PluginState> {
  return new Plugin<PluginState>({
    key: imageUploadPlaceholderKey,
    state: {
      init: () => ({ set: DecorationSet.empty, uploads: new Map<string, UploadEntry>() }),
      apply(tr, value) {
        const uploads = value.uploads;
        let set = value.set.map(tr.mapping, tr.doc);
        const meta = tr.getMeta(imageUploadPlaceholderKey) as PlaceholderMeta | undefined;

        if (meta?.remove) {
          const removeId = meta.remove.id;
          set = set.remove(set.find(undefined, undefined, (spec) => spec.id === removeId));
          uploads.delete(removeId);
          progressEls.delete(removeId);
        }
        if (meta?.redraw) {
          const redrawId = meta.redraw.id;
          set = set.remove(set.find(undefined, undefined, (spec) => spec.id === redrawId));
        }

        // 진행 중인 업로드인데 decoration이 없으면(신규 추가, redraw,
        // 혹은 원격 변경의 노드 교체로 mapping에서 탈락) 추적 위치에 다시 그림
        const alive = new Set(set.find().map((deco) => deco.spec.id as string));
        for (const [id, entry] of uploads) {
          if (alive.has(id)) continue;
          const mappedPos = Math.min(tr.mapping.map(entry.pos), tr.doc.content.size);
          entry.pos = mappedPos;
          set = set.add(tr.doc, [createPlaceholderDecoration(id, mappedPos)]);
        }

        // decoration 기준으로 추적 위치 동기화
        for (const deco of set.find()) {
          const entry = uploads.get(deco.spec.id as string);
          if (entry) entry.pos = deco.from;
        }

        return { set, uploads };
      },
    },
    props: {
      decorations(state) {
        return this.getState(state)?.set;
      },
    },
  });
}

export interface AddImageUploadPlaceholderOptions {
  id: string;
  pos: number;
  /** 로컬 미리보기용 blob: URL */
  previewUrl: string;
  fileName: string;
}

export function addImageUploadPlaceholder(view: EditorView, options: AddImageUploadPlaceholderOptions): void {
  if (view.isDestroyed) return;
  const pluginState = imageUploadPlaceholderKey.getState(view.state);
  if (!pluginState) return;
  pluginState.uploads.set(options.id, {
    previewUrl: options.previewUrl,
    fileName: options.fileName,
    progress: 0,
    error: false,
    pos: options.pos,
  });
  // 문서 변경 없는 빈 트랜잭션 — apply의 부활 로직이 decoration을 추가함
  view.dispatch(view.state.tr.setMeta(imageUploadPlaceholderKey, {} as PlaceholderMeta));
}

/** 진행률 갱신 — 트랜잭션/문서 변경 없이 decoration DOM만 수정 */
export function updateImageUploadPlaceholderProgress(view: EditorView, id: string, progress: number): void {
  if (view.isDestroyed) return;
  const entry = imageUploadPlaceholderKey.getState(view.state)?.uploads.get(id);
  if (!entry) return;
  entry.progress = progress;
  const el = progressEls.get(id);
  if (el) el.textContent = `Uploading ${progress}%`;
}

export function findImageUploadPlaceholderPos(state: EditorState, id: string): number | null {
  return imageUploadPlaceholderKey.getState(state)?.uploads.get(id)?.pos ?? null;
}

export function removeImageUploadPlaceholder(view: EditorView, id: string): void {
  if (view.isDestroyed) {
    progressEls.delete(id);
    return;
  }
  view.dispatch(view.state.tr.setMeta(imageUploadPlaceholderKey, { remove: { id } } as PlaceholderMeta));
}

/** 업로드 실패 — decoration을 에러 블록으로 전환 (로컬 전용, 공유 문서 영향 없음) */
export function setImageUploadPlaceholderError(view: EditorView, id: string, fileName?: string): void {
  if (view.isDestroyed) {
    progressEls.delete(id);
    return;
  }
  const entry = imageUploadPlaceholderKey.getState(view.state)?.uploads.get(id);
  if (!entry) return;
  entry.error = true;
  if (fileName) entry.fileName = fileName;
  view.dispatch(view.state.tr.setMeta(imageUploadPlaceholderKey, { redraw: { id } } as PlaceholderMeta));
}

export interface CompleteImageUploadOptions {
  src: string;
  alt?: string;
  caption?: string;
  width?: string;
  height?: string;
}

/**
 * 업로드 완료 — placeholder 위치에 최종 URL 이미지 노드를 1회 삽입하고 decoration 제거.
 * selection은 건드리지 않으므로 업로더 커서를 빼앗지 않는다.
 * @returns 삽입 성공 여부
 */
export function completeImageUploadPlaceholder(
  view: EditorView,
  id: string,
  options: CompleteImageUploadOptions
): boolean {
  if (view.isDestroyed) {
    progressEls.delete(id);
    return false;
  }
  const pos = findImageUploadPlaceholderPos(view.state, id);
  if (pos == null) {
    removeImageUploadPlaceholder(view, id);
    return false;
  }
  const imageType = view.state.schema.nodes.image;
  if (!imageType) {
    removeImageUploadPlaceholder(view, id);
    return false;
  }
  const node = imageType.create({
    src: options.src,
    alt: options.alt ?? 'Image',
    caption: options.caption ?? '',
    width: options.width ?? '100%',
    height: options.height ?? 'auto',
  });
  const tr = view.state.tr;
  tr.replaceRangeWith(pos, pos, node);
  tr.setMeta(imageUploadPlaceholderKey, { remove: { id } } as PlaceholderMeta);
  view.dispatch(tr);
  return true;
}
