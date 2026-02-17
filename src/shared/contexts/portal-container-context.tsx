'use client';

import { createContext, useContext } from 'react';

/**
 * Portal container context.
 * WhiteEditorThemeProvider가 제공하는 wrapper 요소를 저장하여,
 * portal로 렌더링되는 UI(floating toolbar, 드롭다운, 팝오버, 다이얼로그 등)가
 * 해당 wrapper 안에서 렌더링되도록 합니다.
 *
 * null이면 Radix 기본값(document.body)으로 fallback됩니다.
 */
export const PortalContainerContext = createContext<HTMLElement | null>(null);

/**
 * portal container 요소를 반환합니다.
 * WhiteEditorThemeProvider 안에서 사용하면 wrapper 요소를 반환하고,
 * 밖에서 사용하면 null을 반환합니다 (Radix는 null일 때 document.body로 fallback).
 */
export function usePortalContainer(): HTMLElement | null {
  return useContext(PortalContainerContext);
}
