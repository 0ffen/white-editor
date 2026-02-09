'use client';

import type { JSONContent } from '@tiptap/react';

const EMPTY_DOC: JSONContent = { type: 'doc', content: [] };

/**
 * JSONContent가 유효한지 검증합니다.
 * JSONContent는 최소한 type 속성을 가진 객체여야 합니다.
 *
 * @param data - 검증할 값
 * @returns data가 유효한 JSONContent이면 true
 */
export function isValidJSONContent(data: unknown): data is JSONContent {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }

  const obj = data as Record<string, unknown>;
  if (!('type' in obj) || typeof obj.type !== 'string') {
    return false;
  }
  if ('content' in obj && obj.content !== undefined && !Array.isArray(obj.content)) {
    return false;
  }
  return true;
}

/**
 * mention 사이의 빈 text node를 공백으로 대체합니다.
 * 에디터에서 연속 mention 시 생성되는 빈 text node가 렌더링되지 않아
 * mention들이 붙어버리는 문제를 해결합니다.
 *
 * @param content - 정규화할 JSONContent
 * @returns mention 사이 빈 텍스트가 공백으로 치환된 JSONContent
 */
export function normalizeEmptyTextBetweenMentions(content: JSONContent): JSONContent {
  if (!content.content || !Array.isArray(content.content)) {
    return content;
  }

  const normalizedChildren = content.content.map((child, index, arr) => {
    const normalizedChild = normalizeEmptyTextBetweenMentions(child);

    if (normalizedChild.type === 'text' && normalizedChild.text === '') {
      const prevNode = arr[index - 1];
      const nextNode = arr[index + 1];
      if (prevNode?.type === 'mention' || nextNode?.type === 'mention') {
        return { ...normalizedChild, text: ' ' };
      }
    }

    return normalizedChild;
  });

  return { ...content, content: normalizedChildren };
}

/**
 * unknown에서 정규화할 JSONContent를 추출합니다.
 * 유효하지 않으면 null을 반환합니다.
 */
function extractRawContent(content: unknown): JSONContent | null {
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return null;
  }

  const obj = content as Record<string, unknown>;
  if (Object.keys(obj).length === 0) {
    return null;
  }

  if (isValidJSONContent(content)) {
    return content;
  }

  const inner = obj.content;
  if (inner === null || inner === undefined) {
    return null;
  }

  if (typeof inner === 'object' && !Array.isArray(inner) && isValidJSONContent(inner)) {
    return inner;
  }
  if (Array.isArray(inner)) {
    return { type: 'doc', content: inner as JSONContent[] };
  }

  return null;
}

/**
 * 스키마를 정규화하여 JSONContent를 추출합니다.
 * - { content: JSONContent, html?: string } 형태에서 JSONContent 추출
 * - 이미 JSONContent인 경우 그대로 정규화
 * - 유효하지 않으면 빈 doc 반환
 *
 * @param content - 정규화할 값 (unknown)
 * @returns 정규화된 JSONContent
 */
export function normalizeContentSchema(content: unknown): JSONContent {
  const raw = extractRawContent(content);
  return raw ? normalizeContent(normalizeEmptyTextBetweenMentions(raw)) : EMPTY_DOC;
}

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
    return EMPTY_DOC;
  }

  const normalized = JSON.parse(JSON.stringify(content)) as JSONContent;

  function normalizeNode(node: JSONContent): JSONContent | null {
    // editor/viewer는 text가 숫자 등 비문자열일 때 콘텐츠를 불러오지 못함 (테이블 등에서 발생). 반드시 문자열로 정규화.
    if (node.text !== undefined && node.text !== null) {
      node.text = String(node.text);
    }

    const isEmptyTextNode = node.type === 'text' && (node.text === '' || node.text === null || node.text === undefined);
    if (isEmptyTextNode) {
      return null;
    }

    if (node.content && Array.isArray(node.content)) {
      const normalizedContent = node.content
        .map(normalizeNode)
        .filter((n): n is JSONContent => n !== null && n !== undefined);
      node.content = normalizedContent;
    }

    return node;
  }

  const result = normalizeNode(normalized);
  return result ?? EMPTY_DOC;
}
