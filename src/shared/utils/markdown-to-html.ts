'use client';

import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
});

/**
 * Markdown 문자열을 HTML로 변환합니다.
 * 서버사이드에서는 빈 문자열을 반환합니다.
 *
 * @param markdown - 변환할 Markdown 문자열
 * @returns 변환된 HTML 문자열 (클라이언트에서만), 서버사이드에서는 빈 문자열
 * @example
 * ```ts
 * const html = markdownToHtml('# Hello World');
 * // Returns: '<h1>Hello World</h1>'
 * ```
 */
export const markdownToHtml = (markdown: string) => {
  if (typeof window === 'undefined') {
    return '';
  }

  return md.render(markdown);
};
