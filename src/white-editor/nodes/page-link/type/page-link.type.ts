// 실제 페이지 링크 데이터 타입 (사용하는 쪽에서 정의)
export interface PageLink {
  id: string;
  title: string;
  href: string;
}

// 페이지 링크 설정 타입 (필드 매핑 정보만 포함)
export interface PageLinkConfig<T = Record<string, unknown>> {
  id: keyof T; // id 필드명
  title: keyof T; // 제목 필드명
  href: keyof T; // 링크 필드명
  path?: keyof T; // 경로 정보 필드명 (optional)
  renderLabel?: (item: T) => React.ReactNode; // 커스텀 제목 렌더링 (optional)
}
