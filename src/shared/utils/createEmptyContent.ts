/**
 * 간단한 빈 콘텐츠를 생성하는 유틸리티 함수
 * @name createEmptyContent
 * @returns Tiptap JSON 형식의 빈 콘텐츠
 */
export function createEmptyContent() {
  return {
    type: 'doc',
    content: [],
  };
}
