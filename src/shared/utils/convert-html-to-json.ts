import { generateJSON } from '@tiptap/react';
import { createViewerExtensions } from './extensions';

/**
 * HTML 문자열을 JSON 객체로 변환하는 유틸 - 뷰어 전용
 * @param htmlContent 변환할 HTML 문자열
 * @returns  JSON 객체
 */
export function convertHtmlToJson(htmlContent: string) {
  const extensions = createViewerExtensions();
  return generateJSON(htmlContent, extensions);
}
