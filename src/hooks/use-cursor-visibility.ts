import * as React from 'react';
import { useWindowSize } from '@/hooks/use-window-size';
import type { Editor } from '@tiptap/react';
import { useBodyRect } from './use-element-rect';

export interface CursorVisibilityOptions {
  editor?: Editor | null;
  overlayHeight?: number;
}

/**
 * @name useCursorVisibility
 * @description
 * Tiptap 에디터에서 입력 시 커서가 항상 보이도록 보장하는 커스텀 훅
 * 툴바(overlay)에 의해 커서가 가려질 경우 자동으로 윈도우를 스크롤
 *
 * @param options.editor Tiptap 에디터 인스턴스
 * @param options.overlayHeight 툴바(overlay) 높이(px)
 * @returns body의 bounding rect 정보
 */
export function useCursorVisibility({ editor, overlayHeight = 0 }: CursorVisibilityOptions) {
  const { height: windowHeight } = useWindowSize();
  const rect = useBodyRect({
    enabled: true,
    throttleMs: 100,
    useResizeObserver: true,
  });

  React.useEffect(() => {
    const ensureCursorVisibility = () => {
      if (!editor) return;

      const { state, view } = editor;
      if (!view.hasFocus()) return;

      // Get current cursor position coordinates
      const { from } = state.selection;
      const cursorCoords = view.coordsAtPos(from);

      if (windowHeight < rect.height && cursorCoords) {
        const availableSpace = windowHeight - cursorCoords.top;

        // If the cursor is hidden behind the overlay or offscreen, scroll it into view
        if (availableSpace < overlayHeight) {
          const targetCursorY = Math.max(windowHeight / 2, overlayHeight);
          const currentScrollY = window.scrollY;
          const cursorAbsoluteY = cursorCoords.top + currentScrollY;
          const newScrollY = cursorAbsoluteY - targetCursorY;

          window.scrollTo({
            top: Math.max(0, newScrollY),
            behavior: 'smooth',
          });
        }
      }
    };

    ensureCursorVisibility();
  }, [editor, overlayHeight, windowHeight, rect.height]);

  return rect;
}
