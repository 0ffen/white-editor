interface CustomThemeColors {
  background?: string;
  foreground?: string;
  card?: string;
  cardForeground?: string;
  popover?: string;
  popoverForeground?: string;
  primary?: string;
  primaryForeground?: string;
  secondary?: string;
  secondaryForeground?: string;
  muted?: string;
  mutedForeground?: string;
  accent?: string;
  accentForeground?: string;
}

interface ThemeConfig {
  mode?: 'light' | 'dark';
  colors?: CustomThemeColors;
}

/**
 * 다크/라이트 테마를 적용합니다.
 * document.documentElement에 'dark' 클래스를 추가하거나 제거합니다.
 * 커스텀 컬러가 제공되면 CSS 변수로 설정합니다.
 * 서버사이드에서는 아무 작업도 수행하지 않습니다.
 *
 * @param theme - 적용할 테마 ('light' | 'dark' | ThemeConfig)
 * @example
 * ```ts
 * applyTheme('dark'); // 다크 테마 적용
 * applyTheme('light'); // 라이트 테마 적용
 * applyTheme({
 *   mode: 'dark',
 *   colors: {
 *     background: '#1a1a1a',
 *     foreground: '#ffffff',
 *     popover: '#2a2a2a'
 *   }
 * }); // 커스텀 컬러와 함께 다크 테마 적용
 * ```
 */
export function applyTheme(theme: 'light' | 'dark' | ThemeConfig) {
  if (typeof window === 'undefined') {
    return;
  }

  const root = document.documentElement;

  // theme이 문자열인 경우 (기존 방식)
  if (typeof theme === 'string') {
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    return;
  }

  // theme이 객체인 경우 (커스텀 컬러 포함)
  const themeConfig = theme as ThemeConfig;
  const mode = themeConfig.mode || 'light';

  // 다크/라이트 모드 적용
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // 커스텀 컬러가 있으면 CSS 변수로 설정
  if (themeConfig.colors) {
    const cssVariables: Record<string, string> = {};

    if (themeConfig.colors.background) {
      cssVariables['--we-background'] = themeConfig.colors.background;
    }
    if (themeConfig.colors.foreground) {
      cssVariables['--we-foreground'] = themeConfig.colors.foreground;
    }
    if (themeConfig.colors.card) {
      cssVariables['--we-card'] = themeConfig.colors.card;
    }
    if (themeConfig.colors.cardForeground) {
      cssVariables['--we-card-foreground'] = themeConfig.colors.cardForeground;
    }
    if (themeConfig.colors.popover) {
      cssVariables['--we-popover'] = themeConfig.colors.popover;
    }
    if (themeConfig.colors.popoverForeground) {
      cssVariables['--we-popover-foreground'] = themeConfig.colors.popoverForeground;
    }
    if (themeConfig.colors.primary) {
      cssVariables['--we-primary'] = themeConfig.colors.primary;
    }
    if (themeConfig.colors.primaryForeground) {
      cssVariables['--we-primary-foreground'] = themeConfig.colors.primaryForeground;
    }
    if (themeConfig.colors.secondary) {
      cssVariables['--we-secondary'] = themeConfig.colors.secondary;
    }
    if (themeConfig.colors.secondaryForeground) {
      cssVariables['--we-secondary-foreground'] = themeConfig.colors.secondaryForeground;
    }
    if (themeConfig.colors.muted) {
      cssVariables['--we-muted'] = themeConfig.colors.muted;
    }
    if (themeConfig.colors.mutedForeground) {
      cssVariables['--we-muted-foreground'] = themeConfig.colors.mutedForeground;
    }
    if (themeConfig.colors.accent) {
      cssVariables['--we-accent'] = themeConfig.colors.accent;
    }
    if (themeConfig.colors.accentForeground) {
      cssVariables['--we-accent-foreground'] = themeConfig.colors.accentForeground;
    }

    if (Object.keys(cssVariables).length > 0) {
      setCSSVariables(cssVariables);
    }
  }
}

/**
 * CSS 변수를 설정합니다.
 * document.documentElement의 style 속성에 CSS 변수를 설정합니다.
 * 서버사이드에서는 아무 작업도 수행하지 않습니다.
 *
 * @param variables - 설정할 CSS 변수 객체 (키: CSS 변수명, 값: 변수 값)
 * @example
 * ```ts
 * setCSSVariables({
 *   '--primary-color': '#007bff',
 *   '--secondary-color': '#6c757d'
 * });
 * ```
 */
export function setCSSVariables(variables: Record<string, string>) {
  if (typeof window === 'undefined') {
    return;
  }

  const root = document.documentElement;

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}
