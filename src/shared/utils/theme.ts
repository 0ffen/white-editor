/**
 * 다크/라이트 테마를 적용합니다.
 * document.documentElement에 'dark' 클래스를 추가하거나 제거합니다.
 * 서버사이드에서는 아무 작업도 수행하지 않습니다.
 *
 * @param theme - 적용할 테마 ('light' | 'dark')
 * @example
 * ```ts
 * applyTheme('dark'); // 다크 테마 적용
 * applyTheme('light'); // 라이트 테마 적용
 * ```
 */
export function applyTheme(theme: 'light' | 'dark') {
  if (typeof window === 'undefined') {
    return;
  }

  const root = document.documentElement;

  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
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
