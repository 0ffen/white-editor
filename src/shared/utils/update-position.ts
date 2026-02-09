'use client';

import { computePosition, flip, shift } from '@floating-ui/dom';
import { Editor, posToDOMRect } from '@tiptap/react';

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
export const updatePosition = (editor: Editor, element: HTMLElement) => {
  if (typeof window === 'undefined') {
    return;
  }

  const virtualElement = {
    getBoundingClientRect: () => posToDOMRect(editor.view, editor.state.selection.from, editor.state.selection.to),
  };

  computePosition(virtualElement, element, {
    placement: 'bottom-start',
    strategy: 'absolute',
    middleware: [shift(), flip()],
  }).then(({ x, y, strategy }: { x: number; y: number; strategy: string }) => {
    element.style.width = 'max-content';
    element.style.position = strategy;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  });
};
