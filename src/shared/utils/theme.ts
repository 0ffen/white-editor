'use client';

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
    if (c.textNormal != null) cssVariables['--we-text-normal'] = c.textNormal;
    if (c.textLight != null) cssVariables['--we-text-light'] = c.textLight;
    if (c.textSub != null) cssVariables['--we-text-sub'] = c.textSub;
    if (c.textPlaceholder != null) cssVariables['--we-text-placeholder'] = c.textPlaceholder;
    if (c.elevationBackground != null) cssVariables['--we-elevation-background'] = c.elevationBackground;
    if (c.elevationLevel1 != null) cssVariables['--we-elevation-level1'] = c.elevationLevel1;
    if (c.elevationLevel2 != null) cssVariables['--we-elevation-level2'] = c.elevationLevel2;
    if (c.elevationDropdown != null) cssVariables['--we-elevation-dropdown'] = c.elevationDropdown;
    if (c.borderDefault != null) cssVariables['--we-border-default'] = c.borderDefault;
    if (c.interactionHover != null) cssVariables['--we-interaction-hover'] = c.interactionHover;
    if (c.brandWeak != null) cssVariables['--we-brand-weak'] = c.brandWeak;
    if (c.brandLight != null) cssVariables['--we-brand-light'] = c.brandLight;
    if (c.brandDefault != null) cssVariables['--we-brand-default'] = c.brandDefault;
  }

  if (themeConfig.zIndex) {
    const z = themeConfig.zIndex;
    if (z.toolbar != null) cssVariables['--we-z-index-toolbar'] = String(z.toolbar);
    if (z.inline != null) cssVariables['--we-z-index-inline'] = String(z.inline);
    if (z.handle != null) cssVariables['--we-z-index-handle'] = String(z.handle);
    if (z.overlay != null) cssVariables['--we-z-index-overlay'] = String(z.overlay);
    if (z.floating != null) cssVariables['--we-z-index-floating'] = String(z.floating);
  }

  if (Object.keys(cssVariables).length > 0) {
    setCSSVariables(cssVariables, target);
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
