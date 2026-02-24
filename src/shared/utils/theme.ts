'use client';

const THEME_COLOR_VARIABLES = [
  '--we-text-normal',
  '--we-text-light',
  '--we-text-sub',
  '--we-text-placeholder',
  '--we-elevation-background',
  '--we-elevation-level1',
  '--we-elevation-level2',
  '--we-elevation-dropdown',
  '--we-border-default',
  '--we-interaction-hover',
  '--we-brand-weak',
  '--we-brand-light',
  '--we-brand-default',
] as const;

const THEME_ZINDEX_VARIABLES = [
  '--we-z-index-toolbar',
  '--we-z-index-inline',
  '--we-z-index-handle',
  '--we-z-index-overlay',
  '--we-z-index-floating',
] as const;

const ALL_THEME_VARIABLES = [...THEME_COLOR_VARIABLES, ...THEME_ZINDEX_VARIABLES] as const;

type ThemeColorVariable = (typeof THEME_COLOR_VARIABLES)[number];
type ThemeZIndexVariable = (typeof THEME_ZINDEX_VARIABLES)[number];

const COLOR_KEY_TO_VAR: Record<keyof WhiteEditorThemeColors, ThemeColorVariable> = {
  textNormal: '--we-text-normal',
  textLight: '--we-text-light',
  textSub: '--we-text-sub',
  textPlaceholder: '--we-text-placeholder',
  elevationBackground: '--we-elevation-background',
  elevationLevel1: '--we-elevation-level1',
  elevationLevel2: '--we-elevation-level2',
  elevationDropdown: '--we-elevation-dropdown',
  borderDefault: '--we-border-default',
  interactionHover: '--we-interaction-hover',
  brandWeak: '--we-brand-weak',
  brandLight: '--we-brand-light',
  brandDefault: '--we-brand-default',
};

const ZINDEX_KEY_TO_VAR: Record<keyof WhiteEditorThemeZIndex, ThemeZIndexVariable> = {
  toolbar: '--we-z-index-toolbar',
  inline: '--we-z-index-inline',
  handle: '--we-z-index-handle',
  overlay: '--we-z-index-overlay',
  floating: '--we-z-index-floating',
};

/**
 * design-tokens.css 변수명과 1:1 대응하는 테마 컬러 (camelCase).
 * 지정한 항목만 --we-* CSS 변수로 적용되고, 나머지는 design-tokens.css 기본값 사용.
 *
 * 값: hex, rgb, hsl 또는 var(--호스트앱에서 정의한 변수) 모두 가능.
 * 다른 프로젝트에서 theme 커스텀 시 var() 로 자체 디자인 토큰을 넘기면 됨.
 * var() 참조 변수는 호스트 앱 CSS에 정의되어 있어야 하며, 에디터 번들 --color-* 와
 * 이름이 겹치면 순환 참조가 날 수 있으므로 호스트 전용 변수명 또는 hex 권장.
 */
export interface WhiteEditorThemeColors {
  /** 본문 텍스트 */
  textNormal?: string;
  /** 보조 텍스트, 이미지 도형 비선택 색 */
  textLight?: string;
  /** 드롭다운/메뉴 보조 텍스트 */
  textSub?: string;
  /** 에디터 플레이스홀더 */
  textPlaceholder?: string;
  /** 에디터/뷰어 배경 */
  elevationBackground?: string;
  /** 카드/블록 배경 */
  elevationLevel1?: string;
  /** 코드블록 배경 등 */
  elevationLevel2?: string;
  /** 커맨드 리스트·드롭다운 배경 */
  elevationDropdown?: string;
  /** 구분선, 핸들, 테두리 */
  borderDefault?: string;
  /** 호버 배경 */
  interactionHover?: string;
  /** 선택/강조 배경 */
  brandWeak?: string;
  /** 선택 테두리, 하이라이트, 버튼 */
  brandLight?: string;
  /** 링크/액센트, 도형 선택, 인라인 코드 등 */
  brandDefault?: string;
}

/**
 * z-index 레이어 커스텀 (숫자만 전달, CSS에 그대로 적용).
 */
export interface WhiteEditorThemeZIndex {
  toolbar?: number;
  inline?: number;
  handle?: number;
  overlay?: number;
  floating?: number;
}

export interface ThemeConfig {
  mode?: 'light' | 'dark';
  colors?: WhiteEditorThemeColors;
  zIndex?: WhiteEditorThemeZIndex;
}

/**
 * 다크/라이트 테마를 적용합니다.
 * target 요소에 'dark' 클래스를 추가하거나 제거합니다.
 * design token 기반 colors / zIndex가 제공되면 해당 CSS 변수로 설정합니다.
 * 서버사이드에서는 아무 작업도 수행하지 않습니다.
 *
 * @param theme - 적용할 테마 ('light' | 'dark' | ThemeConfig)
 * @param target - 테마를 적용할 대상 요소 (기본값: document.documentElement)
 * @example
 * ```ts
 * applyTheme('dark');
 * applyTheme({ mode: 'dark', colors: { textNormal: '#e0e0e0', elevationBackground: '#1a1a1a' } });
 * applyTheme({ mode: 'light', zIndex: { overlay: 100, floating: 100 } });
 *
 * // 특정 요소에 스코핑
 * applyTheme('dark', myElement);
 * ```
 */
export function applyTheme(theme: 'light' | 'dark' | ThemeConfig, target: HTMLElement = document.documentElement) {
  if (typeof window === 'undefined') {
    return;
  }

  // theme이 문자열인 경우 (기존 방식)
  if (typeof theme === 'string') {
    if (theme === 'dark') {
      target.classList.add('dark');
    } else {
      target.classList.remove('dark');
    }
    return;
  }

  // theme이 객체인 경우 (커스텀 컬러 포함)
  const themeConfig = theme as ThemeConfig;
  const mode = themeConfig.mode || 'light';

  // 다크/라이트 모드 적용
  if (mode === 'dark') {
    target.classList.add('dark');
  } else {
    target.classList.remove('dark');
  }

  const cssVariables: Record<string, string> = {};

  if (themeConfig.colors) {
    const c = themeConfig.colors;
    for (const [key, varName] of Object.entries(COLOR_KEY_TO_VAR)) {
      const value = c[key as keyof WhiteEditorThemeColors];
      if (value != null) cssVariables[varName] = value;
    }
  }

  if (themeConfig.zIndex) {
    const z = themeConfig.zIndex;
    for (const [key, varName] of Object.entries(ZINDEX_KEY_TO_VAR)) {
      const value = z[key as keyof WhiteEditorThemeZIndex];
      if (value != null) cssVariables[varName] = String(value);
    }
  }

  if (Object.keys(cssVariables).length > 0) {
    setCSSVariables(cssVariables, target);
  }
}

/**
 * applyTheme로 설정된 테마를 완전히 제거합니다.
 * 'dark' 클래스를 제거하고, applyTheme이 설정하는 모든 --we-* CSS 변수를
 * target 요소의 인라인 스타일에서 제거합니다.
 * 호스트 앱이 설정한 다른 인라인 스타일에는 영향을 주지 않습니다.
 * 서버사이드에서는 아무 작업도 수행하지 않습니다.
 *
 * @param target - 테마를 제거할 대상 요소 (기본값: document.documentElement)
 * @example
 * ```ts
 * removeTheme();
 *
 * // 특정 요소에서 제거
 * removeTheme(myElement);
 * ```
 */
export function removeTheme(target: HTMLElement = document.documentElement) {
  if (typeof window === 'undefined') {
    return;
  }

  target.classList.remove('dark');

  for (const varName of ALL_THEME_VARIABLES) {
    target.style.removeProperty(varName);
  }
}

/**
 * CSS 변수를 설정합니다.
 * 지정한 target 요소의 style 속성에 CSS 변수를 설정합니다.
 * 서버사이드에서는 아무 작업도 수행하지 않습니다.
 *
 * @param variables - 설정할 CSS 변수 객체 (키: CSS 변수명, 값: 변수 값)
 * @param target - CSS 변수를 설정할 대상 요소 (기본값: document.documentElement)
 * @example
 * ```ts
 * setCSSVariables({
 *   '--primary-color': '#007bff',
 *   '--secondary-color': '#6c757d'
 * });
 *
 * // 특정 요소에 스코핑
 * setCSSVariables({ '--primary-color': '#007bff' }, myElement);
 * ```
 */
export function setCSSVariables(variables: Record<string, string>, target: HTMLElement = document.documentElement) {
  if (typeof window === 'undefined') {
    return;
  }

  Object.entries(variables).forEach(([key, value]) => {
    target.style.setProperty(key, value);
  });
}
