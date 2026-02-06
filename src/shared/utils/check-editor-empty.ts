import type { JSONContent } from '@tiptap/react';

/**
 * 기본 빈 paragraph 노드인지 확인하는 함수
 * paragraph 노드이고 텍스트가 없거나 공백만 있으면 true
 */
function isEmptyParagraph(node: JSONContent): boolean {
  if (node.type !== 'paragraph') {
    return false;
  }

  // paragraph에 하위 content가 없으면 빈 paragraph
  if (!Array.isArray(node.content) || node.content.length === 0) {
    return true;
  }

  // paragraph의 모든 하위 노드가 빈 텍스트 노드인지 확인
  return node.content.every((child) => {
    // 텍스트 노드가 아니면 빈 paragraph가 아님
    if (child.type !== 'text') {
      return false;
    }
    // 텍스트가 없거나 공백만 있으면 빈 것으로 간주 (\u00A0 = non-breaking space)
    return !child.text || child.text.trim() === '' || child.text.trim() === '\u00A0';
  });
}

/**
 * JSONContent에서 실제 콘텐츠가 있는지 재귀적으로 확인하는 함수
 * 기본 빈 상태(빈 paragraph만 있는 경우)가 아니면 true 반환
 */
function hasActualContent(content: JSONContent | null | undefined): boolean {
  if (!content || typeof content !== 'object') {
    return false;
  }

  // doc 타입이 아니면 일단 콘텐츠가 있는 것으로 간주
  if (content.type !== 'doc') {
    // paragraph가 아니거나, paragraph인데 빈 paragraph가 아니면 콘텐츠가 있음
    if (content.type !== 'paragraph' || !isEmptyParagraph(content)) {
      return true;
    }
    return false;
  }

  // doc 타입인 경우
  if (!Array.isArray(content.content) || content.content.length === 0) {
    return false; // content가 없으면 빈 상태
  }

  // 모든 노드가 빈 paragraph인지 확인
  const allEmptyParagraphs = content.content.every((node) => isEmptyParagraph(node));

  // 모든 노드가 빈 paragraph가 아니면 실제 콘텐츠가 있음
  return !allEmptyParagraphs;
}

/**
 * 에디터 필드가 빈 값인지 확인하는 함수
 * - content 필드가 있으면 JSON 구조를 확인하여 실제 콘텐츠 노드(이미지, 코드블럭, 텍스트 등)가 있는지 확인
 * - content 필드가 없으면 html 필드의 텍스트만 확인
 * - 이미지나 코드블럭 같은 경우에는 HTML 텍스트가 없어도 내용이 있을 수 있으므로 JSON 구조를 우선 확인
 *
 * @param editorField - `{ content?: JSONContent; html?: string }` 형태의 저장된 에디터 필드
 * @returns 비어 있으면 true, 내용이 있으면 false
 *
 * @example
 * ```ts
 * import { checkEditorEmpty } from '@0ffen/white-editor';
 *
 * if (checkEditorEmpty(formData.body)) {
 *   setError('내용을 입력해 주세요.');
 * }
 * ```
 */
export function checkEditorEmpty(editorField: { content?: JSONContent; html?: string } | null | undefined): boolean {
  if (!editorField) {
    return true;
  }

  // content 필드가 있으면 JSON 구조를 우선 확인
  if (editorField.content) {
    const hasContent = hasActualContent(editorField.content);
    if (hasContent) {
      return false; // 실제 콘텐츠가 있으면 빈 값이 아님
    }
  }

  // content 필드가 없거나 빈 경우, html 필드 확인
  if (!editorField.html) {
    return true;
  }

  // HTML에서 태그를 제거하고 텍스트만 추출
  const textContent = editorField.html.replace(/<[^>]*>/g, '').trim();

  // 텍스트가 없거나 공백만 있으면 빈 값
  return textContent === '' || textContent === '\u00A0';
}
