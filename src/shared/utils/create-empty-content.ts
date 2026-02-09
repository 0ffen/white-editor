'use client';

/**
 * TipTap 에디터용 빈 콘텐츠를 생성합니다.
 * 초기화나 리셋 시 사용할 수 있는 기본 doc 구조를 반환합니다.
 *
 * @returns 빈 TipTap JSONContent 객체 (type: 'doc', content: [])
 * @example
 * ```ts
 * const emptyContent = createEmptyContent();
 * // Returns: { type: 'doc', content: [] }
 *
 * editor.setContent(emptyContent); // 에디터 초기화
 * ```
 */
export function createEmptyContent() {
  return {
    type: 'doc',
    content: [],
  };
}
