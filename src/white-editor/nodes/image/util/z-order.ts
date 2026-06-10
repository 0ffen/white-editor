import type { default as TuiImageEditorType } from 'tui-image-editor';

/** 캔버스에 추가된 객체의 z-순서 변경 액션 */
export type ZOrderAction = 'front' | 'back' | 'forward' | 'backward';

/** tui 내부 fabric 캔버스 (공개 API에 z-순서 조작이 없어 직접 접근) */
interface FabricCanvas {
  getObjects: () => unknown[];
  getActiveObject: () => unknown;
  bringToFront: (object: unknown) => void;
  bringForward: (object: unknown, intersecting?: boolean) => void;
  sendBackwards: (object: unknown, intersecting?: boolean) => void;
  moveTo: (object: unknown, index: number) => void;
  requestRenderAll: () => void;
  /** true면 선택된 객체도 실제 z-순서 위치 그대로 렌더 (기본 false는 선택 객체를 맨 위로 올림) */
  preserveObjectStacking?: boolean;
}
type GraphicsAccessor = {
  _graphics?: {
    getCanvas?: () => FabricCanvas | undefined;
    getCanvasImage?: () => unknown;
  };
};

function getGraphics(editor: TuiImageEditorType) {
  return (editor as unknown as GraphicsAccessor)._graphics;
}

/**
 * 선택(포커스)한 객체가 자동으로 맨 앞으로 보이지 않고 실제 z-순서 위치 그대로 렌더되도록 설정.
 * fabric 기본값(preserveObjectStacking=false)은 활성 객체를 항상 맨 위에 그려, 앞으로/뒤로 순서가 헷갈리게 됨.
 */
export function preserveObjectStacking(editor: TuiImageEditorType): void {
  const canvas = getGraphics(editor)?.getCanvas?.();
  if (canvas) canvas.preserveObjectStacking = true;
}

/**
 * 현재 선택된 객체의 z-순서를 변경한다.
 * 베이스 이미지(원본)는 fabric의 backgroundImage라 getObjects() 배열에 없고 항상 모든 객체 뒤에 렌더되므로,
 * 추가 객체들끼리만 순서를 바꾸면 된다. (단, 혹시 베이스가 일반 객체로 존재하는 경우엔 그 위로 제한)
 */
export function changeActiveObjectZOrder(editor: TuiImageEditorType, action: ZOrderAction): void {
  const graphics = getGraphics(editor);
  const canvas = graphics?.getCanvas?.();
  if (!canvas) return;

  const obj = canvas.getActiveObject();
  const baseImage = graphics?.getCanvasImage?.();
  // 선택이 없거나 베이스 이미지 자체면 순서 조작하지 않음
  if (!obj || obj === baseImage) return;

  const objects = canvas.getObjects();
  // 베이스가 backgroundImage면 배열에 없어 indexOf가 -1 → 추가 객체가 갈 수 있는 가장 뒤는 0
  const baseIndex = baseImage ? objects.indexOf(baseImage) : -1;
  const minIndex = baseIndex >= 0 ? baseIndex + 1 : 0;
  const currentIndex = objects.indexOf(obj);

  switch (action) {
    case 'front':
      canvas.bringToFront(obj);
      break;
    case 'back':
      canvas.moveTo(obj, minIndex);
      break;
    case 'forward':
      canvas.bringForward(obj);
      break;
    case 'backward':
      if (currentIndex > minIndex) canvas.sendBackwards(obj);
      break;
  }
  canvas.requestRenderAll();
}
