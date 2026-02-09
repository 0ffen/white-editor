import React from 'react';
import { applyTheme } from '@/shared';
import type { WhiteEditorTheme } from '@/white-editor/editor';

/** WhiteEditorThemeProvider를 사용하는 앱에 공통 스타일이 주입되도록 함 */
import '@/shared/styles/index.css';

interface WhiteEditorThemeProviderProps extends React.PropsWithChildren {
  /**
   * 적용할 테마.
   * - 문자열: 'light' | 'dark' → document.documentElement에 .dark 클래스만 토글
   * - 객체: { mode?, colors?, zIndex? } → design token이 document.documentElement에 CSS 변수(--we-*)로 설정됨 (전역)
   * Provider는 WhiteEditor/WhiteViewer를 감싸는 상위에 두면 됨.
   */
  theme: 'light' | 'dark' | WhiteEditorTheme;
}

export function WhiteEditorThemeProvider(props: WhiteEditorThemeProviderProps) {
  const { children, theme } = props;

  React.useEffect(() => {
    if (theme == null) return;
    // theme이 객체면 mode, colors, zIndex 전부 applyTheme에 전달
    applyTheme(theme);
  }, [theme]);

  return <>{children}</>;
}
