import * as React from 'react';
import { useThrottledCallback } from './use-throttled-callback';

export type RectState = Omit<DOMRect, 'toJSON'>;

export interface ElementRectOptions {
  element?: Element | React.RefObject<Element> | string | null; //추적할 요소
  enabled?: boolean; // rect 추적 활성화 여부
  throttleMs?: number;
  useResizeObserver?: boolean; // ResizeObserver 사용 여부
}

const initialRect: RectState = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const isSSR = typeof window === 'undefined';
const hasResizeObserver = !isSSR && typeof ResizeObserver !== 'undefined';

const isClientSide = (): boolean => !isSSR;

/**
 * @name useElementRect
 * @description 요소의 바운딩 rect를 추적하고, 리사이즈/스크롤 등 이벤트에 따라 업데이트
 * @param options 요소 rect 추적을 위한 설정 옵션
 * @returns 해당 요소의 현재 바운딩 rect 정보
 */
export function useElementRect({
  element,
  enabled = true,
  throttleMs = 100,
  useResizeObserver = true,
}: ElementRectOptions = {}): RectState {
  const [rect, setRect] = React.useState<RectState>(initialRect);

  const getTargetElement = React.useCallback((): Element | null => {
    if (!enabled || !isClientSide()) return null;

    if (!element) {
      return document.body;
    }

    if (typeof element === 'string') {
      return document.querySelector(element);
    }

    if ('current' in element) {
      return element.current;
    }

    return element;
  }, [element, enabled]);

  const updateRect = useThrottledCallback(
    () => {
      if (!enabled || !isClientSide()) return;

      const targetElement = getTargetElement();
      if (!targetElement) {
        setRect(initialRect);
        return;
      }

      const newRect = targetElement.getBoundingClientRect();
      setRect({
        x: newRect.x,
        y: newRect.y,
        width: newRect.width,
        height: newRect.height,
        top: newRect.top,
        right: newRect.right,
        bottom: newRect.bottom,
        left: newRect.left,
      });
    },
    throttleMs,
    [enabled, getTargetElement],
    { leading: true, trailing: true }
  );

  React.useEffect(() => {
    if (!enabled || !isClientSide()) {
      setRect(initialRect);
      return;
    }

    const targetElement = getTargetElement();
    if (!targetElement) return;

    updateRect();

    const cleanup: (() => void)[] = [];

    if (useResizeObserver && hasResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        window.requestAnimationFrame(updateRect);
      });
      resizeObserver.observe(targetElement);
      cleanup.push(() => resizeObserver.disconnect());
    }

    const handleUpdate = () => updateRect();

    window.addEventListener('scroll', handleUpdate, { passive: true });
    window.addEventListener('resize', handleUpdate, { passive: true });

    cleanup.push(() => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
    });

    return () => {
      cleanup.forEach((fn) => fn());
      setRect(initialRect);
    };
  }, [enabled, getTargetElement, updateRect, useResizeObserver]);

  return rect;
}

/**
 * body 요소의 바운딩 rect 추적
 */
export function useBodyRect(options: Omit<ElementRectOptions, 'element'> = {}): RectState {
  return useElementRect({
    ...options,
    element: isClientSide() ? document.body : null,
  });
}

/**
 * ref 요소의 바운딩 rect 추적
 */
export function useRefRect<T extends Element>(
  ref: React.RefObject<T>,
  options: Omit<ElementRectOptions, 'element'> = {}
): RectState {
  return useElementRect({ ...options, element: ref });
}
