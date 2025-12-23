import type { JSONContent } from '@tiptap/react';

/**
 * JSONContent를 정규화하여 TipTap에서 올바르게 렌더링되도록 합니다.
 *
 * - text 필드가 숫자인 경우 문자열로 변환
 * - 빈 텍스트 노드 제거 (type: 'text'이고 text가 빈 문자열이거나 없는 경우)
 * - 모든 노드를 재귀적으로 정규화
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

  // 깊은 복사를 통해 원본을 변경하지 않음
  // JSON.parse(JSON.stringify)는 숫자를 그대로 유지하므로, normalizeNode에서 문자열로 변환 필요
  const normalized = JSON.parse(JSON.stringify(content));

  function normalizeNode(node: JSONContent): JSONContent | null {
    // text 필드가 숫자인 경우 문자열로 변환
    // 빌드 최적화를 방지하기 위해 명시적으로 타입 체크
    const textValue = node.text;
    if (textValue !== undefined && textValue !== null) {
      const textType = typeof textValue;
      // 숫자 타입인 경우 문자열로 변환
      if (textType === 'number') {
        node.text = String(textValue);
      } else if (textType !== 'string') {
        // 다른 타입도 문자열로 변환 (안전을 위해)
        node.text = String(textValue);
      }
    }

    // 빈 텍스트 노드 자체를 필터링 (type이 'text'이고 text가 빈 문자열이거나 없는 경우)
    const isEmptyTextNode = node.type === 'text' && (textValue === '' || textValue === null || textValue === undefined);
    if (isEmptyTextNode) {
      // 빈 텍스트 노드는 null을 반환하여 필터링되도록 함
      return null;
    }

    // content 배열이 있으면 재귀적으로 정규화하고 빈 텍스트 노드 필터링
    if (node.content && Array.isArray(node.content)) {
      // 먼저 각 노드를 정규화하고 null인 노드 제거
      const normalizedContent = node.content.map(normalizeNode).filter((childNode): childNode is JSONContent => {
        // null인 노드 제거 (빈 텍스트 노드)
        if (childNode === null || childNode === undefined) {
          return false;
        }
        // 빈 텍스트 노드 필터링 (type이 'text'이고 text가 빈 문자열이거나 없는 경우)
        const isTextNode = childNode.type === 'text';
        const hasEmptyText = !childNode.text || childNode.text === '';
        return !(isTextNode && hasEmptyText);
      });
      node.content = normalizedContent;
    }

    return node;
  }

  const result = normalizeNode(normalized);

  // normalizeNode가 null을 반환한 경우 (빈 텍스트 노드만 있는 경우)
  if (!result || result === null) {
    return { type: 'doc', content: [] };
  }

  // 루트 노드의 content 배열에서 빈 텍스트 노드 제거
  if (result.content && Array.isArray(result.content)) {
    result.content = result.content.filter((node): node is JSONContent => {
      if (!node || node === null) {
        return false;
      }
      const isTextNode = node.type === 'text';
      const hasEmptyText = !node.text || node.text === '';
      return !(isTextNode && hasEmptyText);
    });
  }

  return result;
}
