import type { JSONContent } from '@tiptap/react';

/**
 * JSONContent를 정규화하여 TipTap에서 올바르게 렌더링되도록 합니다.
 *
 * - text 필드가 숫자인 경우 문자열로 변환
 * - 모든 노드를 재귀적으로 정규화
 * - 서버사이드에서는 정규화하지 않고 원본을 그대로 반환
 *
 * @param content - 정규화할 JSONContent 객체 (null 또는 undefined 가능)
 * @returns 정규화된 JSONContent 객체
 * @example
 * ```ts
 * const normalized = normalizeContent({
 *   type: 'paragraph',
 *   content: [{ type: 'text', text: 123 }] // text가 숫자
 * });
 * // Returns: { type: 'paragraph', content: [{ type: 'text', text: '123' }] }
 * ```
 */
export function normalizeContent(content: JSONContent | null | undefined): JSONContent {
  if (!content) {
    return { type: 'doc', content: [] };
  }

  // 서버사이드에서는 정규화하지 않고 그대로 반환 (클라이언트에서만 정규화)
  if (typeof window === 'undefined') {
    return content;
  }

  // 깊은 복사를 통해 원본을 변경하지 않음
  const normalized = JSON.parse(JSON.stringify(content));

  function normalizeNode(node: JSONContent): JSONContent {
    // text 필드가 숫자인 경우 문자열로 변환
    if (node.text !== undefined && typeof node.text !== 'string') {
      node.text = String(node.text);
    }

    // content 배열이 있으면 재귀적으로 정규화
    if (node.content && Array.isArray(node.content)) {
      node.content = node.content.map(normalizeNode);
    }

    return node;
  }

  return normalizeNode(normalized);
}
