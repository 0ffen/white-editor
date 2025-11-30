import { generateHTML, type JSONContent } from '@tiptap/react';
import { createViewerExtensions } from './extensions';

/**
 * TipTap JSONContent를 HTML 문자열로 변환합니다.
 * 서버사이드에서는 빈 문자열을 반환합니다.
 *
 * @param content - 변환할 TipTap JSONContent 객체
 * @returns 변환된 HTML 문자열 (클라이언트에서만), 서버사이드에서는 빈 문자열
 * @example
 * ```ts
 * const html = getHtmlContent({
 *   type: 'doc',
 *   content: [
 *     { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }
 *   ]
 * });
 * // Returns: '<p>Hello</p>'
 * ```
 */
export const getHtmlContent = (content: JSONContent) => {
  if (typeof window === 'undefined') {
    return '';
  }

  if (!content) return '';
  const extensions = createViewerExtensions();
  return generateHTML(content, extensions);
};
