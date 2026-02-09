'use client';

import type { JSONContent } from '@tiptap/react';

export interface HeadingItem {
  level: number;
  text: string;
  index: number;
}

/**
 * JSONContent 노드에서 텍스트만 재귀적으로 추출합니다.
 * heading content 내 text, bold, italic 등 인라인 노드의 텍스트를 이어붙입니다.
 */
function getTextFromNode(node: JSONContent): string {
  if (node.type === 'text' && node.text != null) {
    return String(node.text);
  }
  if (node.content && Array.isArray(node.content)) {
    return node.content.map(getTextFromNode).join('');
  }
  return '';
}

/**
 * JSONContent를 문서 순서(depth-first)로 순회하며 heading 노드만 수집합니다.
 * 목차(TOC) 데이터로 사용할 수 있으며, index는 DOM의 N번째 heading과 1:1 매칭에 사용합니다.
 *
 * @param content - 정규화된 JSONContent (doc)
 * @returns 문서 순서의 heading 배열 (level, text, index)
 */
export function getHeadingsFromContent(content: JSONContent): HeadingItem[] {
  const items: HeadingItem[] = [];
  let index = 0;

  function traverse(node: JSONContent): void {
    if (node.type === 'heading') {
      const level = Math.min(6, Math.max(1, (node.attrs?.level as number) ?? 1));
      const text = getTextFromNode(node).trim();
      items.push({ level, text, index: index++ });
      return;
    }
    if (node.content && Array.isArray(node.content)) {
      for (const child of node.content) {
        traverse(child);
      }
    }
  }

  if (content?.content && Array.isArray(content.content)) {
    for (const child of content.content) {
      traverse(child);
    }
  }

  return items;
}
