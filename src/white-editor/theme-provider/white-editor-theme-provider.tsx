import React from 'react';
import { applyTheme } from '@/shared';
import type { WhiteEditorTheme } from '@/white-editor/editor';

interface WhiteEditorThemeProviderProps extends React.PropsWithChildren {
  theme: 'light' | 'dark' | WhiteEditorTheme;
}

export function WhiteEditorThemeProvider(props: WhiteEditorThemeProviderProps) {
  const { children, theme } = props;

  React.useEffect(() => {
    if (!theme) return;
    applyTheme(theme);
  }, [theme]);

  return children;
}
