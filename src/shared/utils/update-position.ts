'use client';

import { autoUpdate, computePosition, flip, shift } from '@floating-ui/dom';
import { Editor, posToDOMRect } from '@tiptap/react';

export type FloatingLayer = 'floating' | 'modal';

const FLOATING_ZINDEX: Record<FloatingLayer, string> = {
  floating: 'var(--we-z-index-floating)',
  modal: 'var(--we-z-index-modal)',
};

export type AttachFloatingOptions = {
  layer?: FloatingLayer;
};

function applyFloatingStyle(
  element: HTMLElement,
  { x, y, strategy }: { x: number; y: number; strategy: string },
  layer: FloatingLayer = 'floating'
) {
  element.style.width = 'max-content';
  element.style.position = strategy;
  element.style.left = `${x}px`;
  element.style.top = `${y}px`;
  element.style.zIndex = FLOATING_ZINDEX[layer];
}

/**
 * 에디터의 선택 영역을 기준으로 요소의 위치를 업데이트합니다.
 * Floating UI를 사용하여 요소를 적절한 위치에 배치합니다.
 * 서버사이드에서는 아무 작업도 수행하지 않습니다.
 *
 * @param editor - TipTap 에디터 인스턴스
 * @param element - 위치를 업데이트할 HTML 요소
 * @example
 * ```ts
 * updatePosition(editor, tooltipElement);
 * // tooltipElement가 에디터 선택 영역 아래에 배치됨
 * ```
 */
export const updatePosition = (editor: Editor, element: HTMLElement, options?: AttachFloatingOptions) => {
  if (typeof window === 'undefined') {
    return;
  }

  const layer = options?.layer ?? 'floating';
  const virtualElement = {
    getBoundingClientRect: () => posToDOMRect(editor.view, editor.state.selection.from, editor.state.selection.to),
  };

  computePosition(virtualElement, element, {
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [shift(), flip()],
  }).then((coords) => applyFloatingStyle(element, coords, layer));
};

/**
 * 선택 영역에 팝업을 붙이고 스크롤/리사이즈 시에도 따라가게 한다.
 * @returns cleanup 함수
 */
export function attachFloatingToSelection(
  editor: Editor,
  element: HTMLElement,
  options?: AttachFloatingOptions
): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const layer = options?.layer ?? 'floating';
  const virtualElement = {
    getBoundingClientRect: () => {
      if (editor.isDestroyed) {
        return new DOMRect();
      }
      return posToDOMRect(editor.view, editor.state.selection.from, editor.state.selection.to);
    },
  };

  const update = () => {
    if (editor.isDestroyed) return;
    computePosition(virtualElement, element, {
      placement: 'bottom-start',
      strategy: 'fixed',
      middleware: [shift(), flip()],
    }).then((coords) => applyFloatingStyle(element, coords, layer));
  };

  update();
  return autoUpdate(virtualElement, element, update, {
    ancestorScroll: true,
    ancestorResize: true,
    elementResize: true,
    animationFrame: true,
  });
}
