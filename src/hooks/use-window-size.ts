import * as React from 'react';
import { useThrottledCallback } from './use-throttled-callback';

export interface WindowSizeState {
  width: number; //윈도우의 viewport 너비(px)
  height: number; //윈도우의 visual viewport 높이(px)
  offsetTop: number; //viewport의 상단이 layout viewport의 상단에서 떨어진 거리(px)
  offsetLeft: number; //viewport의 좌측이 layout viewport의 좌측에서 떨어진 거리(px)
  scale: number; //viewport의 확대/축소 비율 - 현재 줌 레벨에 따라 요소를 스케일링할 때 사용
}

/**
 * @name useWindowSize
 * @description
 * 윈도우의 viewport 크기, 위치, CSS transform을 추적하는 훅
 *
 * Visual Viewport API를 사용하여 모바일 환경(가상 키보드 등)에서도 정확한 측정값을 제공
 * 값이 실제로 변경될 때만 상태를 업데이트하여 성능을 최적화함
 *
 * @returns viewport 속성과 CSS transform 문자열을 포함한 객체
 */
export function useWindowSize(): WindowSizeState {
  const [windowSize, setWindowSize] = React.useState<WindowSizeState>({
    width: 0,
    height: 0,
    offsetTop: 0,
    offsetLeft: 0,
    scale: 0,
  });

  const handleViewportChange = useThrottledCallback(() => {
    if (typeof window === 'undefined') return;

    const vp = window.visualViewport;
    if (!vp) return;

    const { width = 0, height = 0, offsetTop = 0, offsetLeft = 0, scale = 0 } = vp;

    setWindowSize((prevState) => {
      if (
        width === prevState.width &&
        height === prevState.height &&
        offsetTop === prevState.offsetTop &&
        offsetLeft === prevState.offsetLeft &&
        scale === prevState.scale
      ) {
        return prevState;
      }

      return { width, height, offsetTop, offsetLeft, scale };
    });
  }, 200);

  React.useEffect(() => {
    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    visualViewport.addEventListener('resize', handleViewportChange);

    handleViewportChange();

    return () => {
      visualViewport.removeEventListener('resize', handleViewportChange);
    };
  }, [handleViewportChange]);

  return windowSize;
}
