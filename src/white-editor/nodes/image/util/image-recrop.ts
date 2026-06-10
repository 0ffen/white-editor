import type { default as TuiImageEditorType } from 'tui-image-editor';

/** 더블클릭된 추가 이미지 정보 */
export interface RecropTarget {
  id: number;
  /** 자르기 다이얼로그에 다시 로드할 이미지 data URL (보관된 원본 우선) */
  src: string;
}

interface FabricImageObject {
  type?: string;
  width?: number;
  scaleX?: number;
  scaleY?: number;
  getSrc?: () => string;
  setSrc?: (src: string, callback?: (img: FabricImageObject) => void, options?: { crossOrigin?: string }) => void;
  setCoords?: () => void;
  /** 최초 업로드된 원본 data URL (재크롭 시 원본부터 다시 자를 수 있도록 보관) */
  __originalSrc?: string;
  canvas?: { requestRenderAll?: () => void };
}
interface FabricCanvas {
  on: (event: string, handler: (opt: { target?: unknown }) => void) => void;
  off: (event: string, handler: (opt: { target?: unknown }) => void) => void;
}
type GraphicsAccessor = {
  _graphics?: {
    getCanvas?: () => FabricCanvas | undefined;
    getCanvasImage?: () => unknown;
    getObject?: (id: number) => FabricImageObject | undefined;
    getObjectId?: (object: unknown) => number | string | null;
  };
};

function getGraphics(editor: TuiImageEditorType) {
  return (editor as unknown as GraphicsAccessor)._graphics;
}

/**
 * 최초 추가 시 원본 data URL을 이미지 객체에 보관한다.
 * 이후 더블클릭으로 재크롭할 때 (이미 잘린 결과가 아닌) 원본부터 다시 자를 수 있다.
 */
export function setImageOriginalSrc(editor: TuiImageEditorType, id: number, originalSrc: string): void {
  const obj = getGraphics(editor)?.getObject?.(id);
  if (obj) obj.__originalSrc = originalSrc;
}

/**
 * 캔버스에 추가된 이미지 객체를 더블클릭하면 콜백을 호출한다 (베이스 원본 이미지는 제외).
 * 보관된 원본이 있으면 원본을, 없으면 현재 이미지를 자르기 대상 src로 전달한다.
 * fabric의 mouse:dblclick 이벤트를 직접 구독하며, 해제 함수를 반환한다.
 */
export function onImageObjectDblClick(editor: TuiImageEditorType, handler: (target: RecropTarget) => void): () => void {
  const graphics = getGraphics(editor);
  const canvas = graphics?.getCanvas?.();
  if (!canvas) return () => {};

  const listener = (opt: { target?: unknown }) => {
    const target = opt.target as FabricImageObject | undefined;
    // 이미지 객체가 아니거나 베이스 원본 이미지면 무시
    if (!target || target.type !== 'image' || target === graphics?.getCanvasImage?.()) return;
    // getObjectId는 문자열 key를 반환하므로 숫자로 변환 (없으면 null)
    const id = graphics?.getObjectId?.(target);
    const src = target.__originalSrc ?? target.getSrc?.();
    if (id != null && src) handler({ id: Number(id), src });
  };

  canvas.on('mouse:dblclick', listener);
  return () => canvas.off('mouse:dblclick', listener);
}

/**
 * 재크롭 결과로 기존 이미지 객체의 소스만 교체한다.
 * 객체 자체는 그대로 유지하므로 위치·보관된 원본(__originalSrc)이 보존되고, 객체가 사라지지 않는다.
 * 중심 위치는 유지하고, 화면상 가로 폭이 일정하도록 배율을 재계산한다.
 */
export function replaceImageObjectSrc(editor: TuiImageEditorType, id: number, croppedSrc: string): void {
  const obj = getGraphics(editor)?.getObject?.(id);
  if (!obj?.setSrc) return;

  const prevDisplayWidth = (obj.width ?? 0) * (obj.scaleX ?? 1);
  obj.setSrc(
    croppedSrc,
    (img) => {
      const naturalWidth = img.width ?? 0;
      if (naturalWidth > 0 && prevDisplayWidth > 0) {
        const scale = prevDisplayWidth / naturalWidth;
        img.scaleX = scale;
        img.scaleY = scale;
      }
      img.setCoords?.();
      img.canvas?.requestRenderAll?.();
    },
    { crossOrigin: 'Anonymous' }
  );
}
