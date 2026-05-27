'use client';

import MarkdownIt from 'markdown-it';
import cjkFriendly from 'markdown-it-cjk-friendly';

// CommonMark의 flanking delimiter 규칙은 닫는 `**` 앞이 구두점이고 뒤가 공백·구두점이 아닌
// 글자(예: 한글 조사)일 때 강조를 닫지 못한다. 한국어는 `**데이터베이스(Database)**와`처럼
// 단어에 조사를 붙여 쓰는 일이 잦아 이 케이스를 자주 만난다. cjkFriendly 플러그인은 CJK 문자
// 주변에서만 규칙을 완화해 비-CJK 텍스트의 CommonMark 호환성은 그대로 유지한다.
// 참고: https://github.com/commonmark/commonmark-spec/issues/650
const md = new MarkdownIt({
  html: true,
}).use(cjkFriendly);

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
