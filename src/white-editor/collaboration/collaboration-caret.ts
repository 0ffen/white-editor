import * as Y from 'yjs';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, type EditorState, type Transaction } from '@tiptap/pm/state';
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view';
import {
  absolutePositionToRelativePosition,
  relativePositionToAbsolutePosition,
  setMeta,
  ySyncPluginKey,
} from '@tiptap/y-tiptap';

/**
 * `@tiptap/extension-collaboration-caret` 대체 extension.
 *
 * 기본 커서 플러그인은 원격 선택을 "head 위치 캐럿 위젯 + inline 하이라이트"로만 그려서,
 * 이미지 같은 block 노드의 NodeSelection이 상대방에게 "노드 다음 줄 캐럿"으로 보인다.
 * 이 extension은 렌더링을 직접 제어한다:
 * - 텍스트 캐럿/선택 → 기존과 동일 (캐럿 위젯 + inline 하이라이트)
 * - block 노드 1개를 감싸는 선택(NodeSelection) → 캐럿 위젯 없이 노드 외곽선 + 이름 라벨
 *
 * 로컬 커서 publish(awareness 'cursor' 필드 기록) 로직은 y-tiptap upstream 구현을 따른다.
 *
 * provider는 `{ awareness }` 구조만 요구하므로 y-websocket, Hocuspocus, y-webrtc 등
 * awareness를 노출하는 어떤 provider와도 사용할 수 있다.
 */

/**
 * y-protocols/awareness의 Awareness와 구조적으로 호환되는 최소 인터페이스.
 * y-protocols를 직접 의존하지 않기 위해 패키지 내부에 정의한다.
 */
export interface CollaborationCaretAwareness {
  getStates(): Map<number, Record<string, unknown>>;
  getLocalState(): Record<string, unknown> | null;
  setLocalStateField(field: string, value: unknown): void;
  on(name: string, callback: (...args: never[]) => void): void;
  off(name: string, callback: (...args: never[]) => void): void;
}

/** awareness를 노출하는 provider (y-websocket WebsocketProvider, HocuspocusProvider 등) */
export interface CollaborationCaretProvider {
  awareness: CollaborationCaretAwareness;
}

export interface CollaborationCaretUser {
  name: string;
  color: string;
}

export interface CollaborationCaretOptions {
  /** awareness를 노출하는 Yjs provider. 필수 — 없으면 에디터 생성 시 throw */
  provider: CollaborationCaretProvider | null;
  /** 원격 피어에게 보여줄 로컬 사용자 정보 */
  user: CollaborationCaretUser;
}

const collaborationCaretKey = new PluginKey<DecorationSet>('whiteCollaborationCaret');

const FALLBACK_COLOR = '#ffa500';
const SELECTION_ALPHA_HEX = '4D'; // 30% — inline 하이라이트 배경용

function readSyncState(state: EditorState) {
  const raw: unknown = ySyncPluginKey.getState(state);
  if (!raw || typeof raw !== 'object') return null;
  if (!('doc' in raw) || !('type' in raw) || !('binding' in raw)) return null;
  if ('snapshot' in raw && raw.snapshot != null) return null;

  const { doc: ydoc, type: yType, binding } = raw;
  if (!(ydoc instanceof Y.Doc) || !(yType instanceof Y.XmlFragment)) return null;
  if (!binding || typeof binding !== 'object' || !('mapping' in binding)) return null;
  const { mapping } = binding;
  if (!(mapping instanceof Map) || mapping.size === 0) return null;

  return { ydoc, yType, mapping };
}

function isYChangeOrigin(state: EditorState): boolean {
  const raw: unknown = ySyncPluginKey.getState(state);
  return !!raw && typeof raw === 'object' && 'isChangeOrigin' in raw && raw.isChangeOrigin === true;
}

function readUserInfo(value: unknown): CollaborationCaretUser {
  let name = '';
  let color = FALLBACK_COLOR;
  if (value && typeof value === 'object') {
    if ('name' in value && typeof value.name === 'string') name = value.name;
    if ('color' in value && typeof value.color === 'string') color = value.color;
  }
  return { name, color };
}

/** 기본 커서 빌더와 동일한 DOM 구조 — collaboration-carets__* CSS와 짝을 이룬다 */
function createCaretElement(user: CollaborationCaretUser): HTMLElement {
  const caret = document.createElement('span');
  caret.classList.add('collaboration-carets__caret');
  caret.setAttribute('style', `border-color: ${user.color}`);

  const label = document.createElement('div');
  label.classList.add('collaboration-carets__label');
  label.setAttribute('style', `background-color: ${user.color}`);
  label.insertBefore(document.createTextNode(user.name), null);

  caret.insertBefore(label, null);
  return caret;
}

function buildDecorations(state: EditorState, awareness: CollaborationCaretAwareness): DecorationSet {
  const sync = readSyncState(state);
  if (!sync) return DecorationSet.empty;

  const decorations: Decoration[] = [];

  awareness.getStates().forEach((awarenessState, clientId) => {
    if (clientId === sync.ydoc.clientID) return;

    const cursor: unknown = awarenessState.cursor;
    if (!cursor || typeof cursor !== 'object' || !('anchor' in cursor) || !('head' in cursor)) return;
    if (cursor.anchor == null || cursor.head == null) return;

    const anchor = relativePositionToAbsolutePosition(
      sync.ydoc,
      sync.yType,
      Y.createRelativePositionFromJSON(cursor.anchor),
      sync.mapping
    );
    const head = relativePositionToAbsolutePosition(
      sync.ydoc,
      sync.yType,
      Y.createRelativePositionFromJSON(cursor.head),
      sync.mapping
    );
    if (anchor == null || head == null) return;

    const from = Math.min(anchor, head);
    const to = Math.max(anchor, head);
    if (to > state.doc.content.size) return;

    const user = readUserInfo(awarenessState.user);

    // block 노드 1개를 정확히 감싸는 선택(NodeSelection) → 외곽선 + 라벨, 캐럿 위젯 생략
    const node = from !== to ? state.doc.nodeAt(from) : null;
    if (node && !node.isInline && !node.isText && from + node.nodeSize === to) {
      decorations.push(
        Decoration.node(from, to, {
          class: 'we-remote-node-selection',
          style: `--we-remote-selection-color: ${user.color}`,
          'data-remote-user': user.name,
        })
      );
      return;
    }

    // 텍스트 캐럿/선택 → 캐럿 위젯 + inline 하이라이트
    decorations.push(
      Decoration.widget(head, () => createCaretElement(user), {
        key: `${clientId}`,
        side: 10,
      })
    );
    if (from !== to) {
      decorations.push(
        Decoration.inline(
          from,
          to,
          { style: `background-color: ${user.color}${SELECTION_ALPHA_HEX}` },
          { inclusiveEnd: true, inclusiveStart: false }
        )
      );
    }
  });

  return DecorationSet.create(state.doc, decorations);
}

function createCaretPlugin(
  awareness: CollaborationCaretAwareness,
  user: CollaborationCaretUser
): Plugin<DecorationSet> {
  return new Plugin<DecorationSet>({
    key: collaborationCaretKey,
    state: {
      init: (_config: unknown, state: EditorState) => buildDecorations(state, awareness),
      apply: (tr: Transaction, prev: DecorationSet, _oldState: EditorState, newState: EditorState) => {
        const meta: unknown = tr.getMeta(collaborationCaretKey);
        const awarenessUpdated =
          !!meta && typeof meta === 'object' && 'awarenessUpdated' in meta && meta.awarenessUpdated === true;

        if (awarenessUpdated || isYChangeOrigin(newState) || tr.docChanged) {
          return buildDecorations(newState, awareness);
        }
        return prev.map(tr.mapping, tr.doc);
      },
    },
    props: {
      decorations: (state: EditorState) => collaborationCaretKey.getState(state),
    },
    view: (view: EditorView) => {
      awareness.setLocalStateField('user', { name: user.name, color: user.color });

      const awarenessListener = () => {
        if (!view.isDestroyed) {
          setMeta(view, collaborationCaretKey, { awarenessUpdated: true });
        }
      };

      // upstream(y-tiptap cursor-plugin)의 updateCursorInfo 로직을 따른다
      const updateCursorInfo = () => {
        const sync = readSyncState(view.state);
        if (!sync) return;

        const localState: unknown = awareness.getLocalState();
        const currentCursor: unknown =
          localState && typeof localState === 'object' && 'cursor' in localState ? localState.cursor : null;

        if (view.hasFocus()) {
          const { selection } = view.state;
          const anchor = absolutePositionToRelativePosition(selection.anchor, sync.yType, sync.mapping);
          const head = absolutePositionToRelativePosition(selection.head, sync.yType, sync.mapping);

          const isSameCursor =
            !!currentCursor &&
            typeof currentCursor === 'object' &&
            'anchor' in currentCursor &&
            'head' in currentCursor &&
            Y.compareRelativePositions(Y.createRelativePositionFromJSON(currentCursor.anchor), anchor) &&
            Y.compareRelativePositions(Y.createRelativePositionFromJSON(currentCursor.head), head);

          if (!isSameCursor) {
            awareness.setLocalStateField('cursor', { anchor, head });
          }
          return;
        }

        // blur 시: 이 에디터 binding 소유의 커서면 제거
        if (currentCursor && typeof currentCursor === 'object' && 'anchor' in currentCursor) {
          const ownsCursor =
            relativePositionToAbsolutePosition(
              sync.ydoc,
              sync.yType,
              Y.createRelativePositionFromJSON(currentCursor.anchor),
              sync.mapping
            ) !== null;
          if (ownsCursor) {
            awareness.setLocalStateField('cursor', null);
          }
        }
      };

      awareness.on('change', awarenessListener);
      view.dom.addEventListener('focusin', updateCursorInfo);
      view.dom.addEventListener('focusout', updateCursorInfo);

      return {
        update: updateCursorInfo,
        destroy: () => {
          view.dom.removeEventListener('focusin', updateCursorInfo);
          view.dom.removeEventListener('focusout', updateCursorInfo);
          awareness.off('change', awarenessListener);
          awareness.setLocalStateField('cursor', null);
        },
      };
    },
  });
}

/**
 * 원격 커서/선택 렌더링 extension.
 *
 * 사용:
 * ```ts
 * import Collaboration from '@tiptap/extension-collaboration';
 * import { CollaborationCaret } from '@0ffen/white-editor/collaboration';
 * import '@0ffen/white-editor/collaboration.css';
 *
 * const extensions = [
 *   Collaboration.configure({ document: ydoc }),
 *   CollaborationCaret.configure({ provider, user: { name: '김선임', color: '#3279ec' } }),
 * ];
 * ```
 *
 * 주의:
 * - StarterKit 기본 히스토리와 충돌하므로 `overrideExtensions: { starterKit: { undoRedo: false } }` 필요
 * - Collaboration 사용 시 에디터에 `content`를 넘기면 접속할 때마다 내용이 중복 삽입됨
 */
export const CollaborationCaret = Extension.create<CollaborationCaretOptions>({
  name: 'whiteCollaborationCaret',

  addOptions() {
    return {
      provider: null,
      user: { name: '', color: FALLBACK_COLOR },
    };
  },

  addProseMirrorPlugins() {
    const { provider, user } = this.options;
    if (!provider) {
      throw new Error(
        '[white-editor] CollaborationCaret requires a `provider` option exposing `awareness` (e.g. y-websocket WebsocketProvider).'
      );
    }
    return [createCaretPlugin(provider.awareness, user)];
  },
});
