/**
 * @name applyTheme
 * @description 다크/라이트 테마 적용
 * @param theme 'light' | 'dark'
 */
export function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement;

  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * @name setCSSVariables
 * @description CSS variables 설정
 * @param variables - CSS variables
 */
export function setCSSVariables(variables: Record<string, string>) {
  const root = document.documentElement;

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}
