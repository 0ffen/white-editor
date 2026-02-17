'use client';

import type { Editor } from '@tiptap/react';

/**
 * 에디터 인스턴스로부터 portal container 요소를 찾습니다.
 * WhiteEditorThemeProvider의 wrapper 요소(`[data-we-portal-container]`)를
 * 에디터 DOM에서 탐색하여 반환합니다.
 *
 * ThemeProvider가 없으면 document.body로 fallback합니다.
 *
 * React 컴포넌트에서는 usePortalContainer() 훅을 사용하세요.
 * 이 함수는 React 외부(tiptap suggestion 등)에서 사용합니다.
 */
export function getPortalContainer(editor: Editor): HTMLElement {
  const dom = editor.view.dom;
  const container = dom.closest('[data-we-portal-container]') as HTMLElement | null;
  return container ?? document.body;
}
