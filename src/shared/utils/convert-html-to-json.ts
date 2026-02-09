'use client';

import { generateJSON } from '@tiptap/react';
import { createViewerExtensions } from './extensions';

/**
 * HTML 문자열을 TipTap JSONContent 객체로 변환합니다.
 * 뷰어 전용 extensions를 사용하여 변환합니다.
 * 서버사이드에서는 빈 doc 객체를 반환합니다.
 *
 * @param htmlContent - 변환할 HTML 문자열
 * @returns 변환된 TipTap JSONContent 객체 (클라이언트에서만), 서버사이드에서는 빈 doc 객체
 * @example
 * ```ts
 * const json = convertHtmlToJson('<p>Hello</p>');
 * // Returns: { type: 'doc', content: [{ type: 'paragraph', content: [...] }] }
 * ```
 */
export function convertHtmlToJson(htmlContent: string) {
  if (typeof window === 'undefined') {
    return { type: 'doc', content: [] };
  }

  const extensions = createViewerExtensions();
  return generateJSON(htmlContent, extensions);
}
