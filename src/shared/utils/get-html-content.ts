import { generateHTML, type JSONContent } from '@tiptap/react';
import { createViewerExtensions } from './extensions';

/**
 * @name getHtmlContent
 * @description Tiptap JSONContent를 HTML로 변환
 * @param content
 * @returns HTML
 */
export const getHtmlContent = (content: JSONContent) => {
  if (typeof window === 'undefined') {
    return '';
  }

  if (!content) return '';
  const extensions = createViewerExtensions();
  return generateHTML(content, extensions);
};
