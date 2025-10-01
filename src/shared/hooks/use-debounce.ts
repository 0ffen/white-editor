import React, { useCallback, useRef } from 'react';

/**
 * 콜백 함수를 debounce하는 훅
 * @param callback - debounce할 콜백 함수
 * @param delay - 지연 시간 (밀리초)
 * @returns debounced된 콜백 함수
 */
export function useDebounce<TArgs extends readonly unknown[], TReturn>(
  callback: (...args: TArgs) => TReturn,
  delay: number
): (...args: TArgs) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: TArgs) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  return debouncedCallback;
}

/**
 * 값을 debounce하는 훅
 * @param value - debounce할 값
 * @param delay - 지연 시간 (밀리초)
 * @returns debounced된 값
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}
