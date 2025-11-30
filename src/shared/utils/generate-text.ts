import { generateText, type JSONContent } from '@tiptap/core';
import { createViewerExtensions } from './extensions';

/**
 * TipTap JSONContent에서 순수 텍스트를 추출합니다.
 * 서버사이드에서는 빈 문자열을 반환합니다.
 *
 * @param content - 텍스트를 추출할 TipTap JSONContent 객체
 * @returns 추출된 순수 텍스트 문자열 (클라이언트에서만), 서버사이드에서는 빈 문자열
 * @example
 * ```ts
 * const text = getGeneratedText({
 *   type: 'doc',
 *   content: [
 *     { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }
 *   ]
 * });
 * // Returns: 'Hello'
 * ```
 */
export function getGeneratedText(content: JSONContent) {
  if (typeof window === 'undefined') {
    return '';
  }

  const extention = createViewerExtensions();
  return generateText(content, extention);
}
