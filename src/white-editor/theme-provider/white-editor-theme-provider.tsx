import React from 'react';
import { applyTheme } from '@/shared';
import type { WhiteEditorTheme } from '@/white-editor/editor';

interface WhiteEditorThemeProviderProps extends React.PropsWithChildren {
  /** 'light' | 'dark' 또는 design token 기반 커스텀 테마 (mode, colors, zIndex) */
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
