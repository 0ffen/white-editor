import * as React from 'react';
import throttle from 'lodash.throttle';
import { useUnmount } from '@/hooks';

interface ThrottleSettings {
  leading?: boolean | undefined;
  trailing?: boolean | undefined;
}

const defaultOptions: ThrottleSettings = {
  leading: false,
  trailing: true,
};

/**
 * @name useThrottledCallback
 * @description 지정한 함수를 지정한 시간(ms) 동안 한 번만 실행되도록 제한하는 throttled 콜백 훅
 * @param fn 제한할 함수
 * @param wait 함수가 호출될 최소 간격(ms)
 * @param dependencies 변경을 감지할 의존성 배열
 * @param options throttle 옵션
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThrottledCallback<T extends (...args: any[]) => any>(
  fn: T,
  wait = 250,
  dependencies: React.DependencyList = [],
  options: ThrottleSettings = defaultOptions
): {
  (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T>;
  cancel: () => void;
  flush: () => void;
} {
  const handler = React.useMemo(
    () => throttle<T>(fn, wait, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies
  );

  useUnmount(() => {
    handler.cancel();
  });

  return handler;
}
