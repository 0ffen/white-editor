import React, { useRef, useEffect, useState } from 'react';
import { applyTheme, PortalContainerContext } from '@/shared';
import type { WhiteEditorTheme } from '@/white-editor/editor';

/** WhiteEditorThemeProvider를 사용하는 앱에 공통 스타일이 주입되도록 함 */
import '@/shared/styles/index.css';

interface WhiteEditorThemeProviderProps extends React.PropsWithChildren {
  /**
   * 적용할 테마.
   * - 문자열: 'light' | 'dark' → wrapper 요소에 .dark 클래스만 토글
   * - 객체: { mode?, colors?, zIndex? } → design token이 wrapper 요소에 CSS 변수(--we-*)로 설정됨 (스코핑)
   * Provider는 WhiteEditor/WhiteViewer를 감싸는 상위에 두면 됨.
   * 호스트 앱의 전역 테마에는 영향을 주지 않습니다.
   */
  theme: 'light' | 'dark' | WhiteEditorTheme;
}

export function WhiteEditorThemeProvider(props: WhiteEditorThemeProviderProps) {
  const { children, theme } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  // ref가 연결된 뒤 container state를 설정하여 자식에게 전달
  useEffect(() => {
    setContainer(containerRef.current);
  }, []);

  useEffect(() => {
    if (theme == null || !containerRef.current) return;
    applyTheme(theme, containerRef.current);

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const el = containerRef.current;
      if (!el) return;
      el.classList.remove('dark');
      el.removeAttribute('style');
    };
  }, [theme]);

  return (
    <div ref={containerRef} data-we-portal-container>
      <PortalContainerContext.Provider value={container}>{children}</PortalContainerContext.Provider>
    </div>
  );
}
