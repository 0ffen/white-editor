import React, { useEffect } from 'react';
import { applyTheme, removeTheme } from '@/shared';
import type { WhiteEditorTheme } from '@/white-editor/editor';

/** WhiteEditorThemeStyle를 사용하는 앱에 공통 스타일이 주입되도록 함 */
import '@/shared/styles/index.css';

interface WhiteEditorThemeStyleProps {
  /**
   * 적용할 테마.
   * - 문자열: 'light' | 'dark' → wrapper 요소에 .dark 클래스만 토글
   * - 객체: { mode?, colors?, zIndex? } → design token이 wrapper 요소에 CSS 변수(--we-*)로 설정됨 (스코핑)
   * 호스트 앱의 전역 테마에는 영향을 주지 않습니다.
   */
  theme: 'light' | 'dark' | WhiteEditorTheme;
  /** 테마를 적용할 루트 요소. 기본값은 document.documentElement */
  rootRef?: React.RefObject<HTMLElement>;
}

export function WhiteEditorThemeStyle(props: WhiteEditorThemeStyleProps) {
  const { theme, rootRef } = props;

  useEffect(() => {
    const root = rootRef?.current ?? document.documentElement;

    if (theme == null) return;
    applyTheme(theme, root);

    return () => {
      removeTheme(root);
    };
  }, [theme, rootRef]);

  return null;
}
