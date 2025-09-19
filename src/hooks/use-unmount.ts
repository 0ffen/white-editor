import { useRef, useEffect } from 'react';

/**
 * @name useUnmount
 * @description 컴포넌트가 언마운트될 때 콜백 함수를 실행하는 훅
 * @param callback 컴포넌트 언마운트 시 호출될 함수
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useUnmount = (callback: (...args: Array<any>) => any) => {
  const ref = useRef(callback);
  ref.current = callback;

  useEffect(
    () => () => {
      ref.current();
    },
    []
  );
};
