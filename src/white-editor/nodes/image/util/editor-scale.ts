import type { default as TuiImageEditorType } from 'tui-image-editor';

/** ImageEditor의 cssMaxWidth/cssMaxHeight (캔버스가 화면에 표시되는 최대 크기) */
export const EDITOR_DISPLAY_WIDTH = 720;
export const EDITOR_DISPLAY_HEIGHT = 400;

/** 객체 선택 핸들(코너)의 화면상 기준 크기(px) */
const BASE_CORNER_SIZE = 12;

/** 추가 이미지가 차지할 기본 이미지 대비 최대 비율 (원본을 덮지 않도록) */
const ADD_IMAGE_FRACTION = 0.4;

/**
 * 에디터 기본 폰트 패밀리(--we-font-family-base)를 반환.
 * fabric/tui 기본값 'Times New Roman'에는 한글 글리프가 없어 폴백 측정·렌더가 어긋나 trailing 갭이 생기므로,
 * 한글을 지원하는 에디터 폰트를 캔버스 텍스트에도 적용해 측정과 렌더를 동일 폰트로 일치시킨다.
 */
export function getEditorFontFamily(): string {
  if (typeof window === 'undefined') return 'sans-serif';
  const el = document.querySelector('.white-editor') ?? document.documentElement;
  const value = getComputedStyle(el).getPropertyValue('--we-font-family-base').trim();
  return value || 'sans-serif';
}

/** tui 내부 fabric 객체 (핸들 크기/비율유지 보정을 위해 직접 접근) */
interface FabricControllableObject {
  cornerSize?: number;
  touchCornerSize?: number;
  lockUniScaling?: boolean;
  setControlsVisibility?: (options: Record<string, boolean>) => void;
  canvas?: { requestRenderAll?: () => void };
}
type GraphicsAccessor = { _graphics?: { getObject?: (id: number) => FabricControllableObject | undefined } };

export function getFabricObject(editor: TuiImageEditorType, id: number): FabricControllableObject | undefined {
  return (editor as unknown as GraphicsAccessor)._graphics?.getObject?.(id);
}

/**
 * 캔버스(이미지 원본 해상도)가 화면에 표시될 때의 축소 배율의 역수.
 * 폰트/핸들/추가 이미지 크기를 이 값으로 곱하면 이미지 해상도와 무관하게 화면상 일정한 크기로 보인다.
 */
export function getDisplayInverseScale(editor: TuiImageEditorType): number {
  const { width, height } = editor.getCanvasSize();
  return Math.max(width / EDITOR_DISPLAY_WIDTH, height / EDITOR_DISPLAY_HEIGHT, 1);
}

/** 선택 핸들(코너)이 큰 이미지에서 작아지지 않도록 표시 배율로 보정 */
export function applyHandleScale(editor: TuiImageEditorType, id: number): void {
  const obj = getFabricObject(editor, id);
  if (!obj) return;
  const cornerSize = Math.round(BASE_CORNER_SIZE * getDisplayInverseScale(editor));
  obj.cornerSize = cornerSize;
  obj.touchCornerSize = cornerSize;
  obj.canvas?.requestRenderAll?.();
}

/**
 * 추가한 이미지를 기본 이미지보다 작게(원본을 덮지 않도록) 축소할 scale 값을 계산.
 * 이미 충분히 작으면 1(확대 안 함)을 반환.
 */
export function getAddImageScale(editor: TuiImageEditorType, imgWidth: number, imgHeight: number): number {
  const { width: baseW, height: baseH } = editor.getCanvasSize();
  return Math.min((baseW * ADD_IMAGE_FRACTION) / imgWidth, (baseH * ADD_IMAGE_FRACTION) / imgHeight, 1);
}
