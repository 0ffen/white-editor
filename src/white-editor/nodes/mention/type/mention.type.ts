import type React from 'react';
import type { ListItem } from '@/shared/utils';
import type { Editor } from '@tiptap/react';

interface SuggestionProps {
  editor: Editor;
  clientRect?: (() => DOMRect | null) | null;
  query: string;
  items: ListItem[];
  command: (item: ListItem) => void;
}

interface KeyDownProps {
  event: KeyboardEvent;
}

interface MentionSuggestionConfig {
  items?: (props: { query: string; editor: Editor }) => ListItem[];
  render: () => {
    onStart: (props: SuggestionProps) => void;
    onUpdate: (props: SuggestionProps) => void;
    onKeyDown: (props: KeyDownProps) => boolean;
    onExit: () => void;
  };
}

interface MentionConfig<T> {
  data: T[] | null;
  id: string;
  label: string;
  renderLabel?: (item: T) => React.ReactNode; // 커스텀 이름 렌더링 (optional)
  sectionLabel?: string; // 섹션 라벨 (기본값: 'People')
  showSectionLabel?: boolean; // 섹션 라벨 표시 여부 (기본값: false)
}

interface UnifiedMentionItem {
  type: 'mention' | 'pageMention';
  id: string;
  label: string; // 기본 라벨 (커스텀 렌더링이 없을 때 사용)
  path?: string; // 페이지 경로 정보 (optional)
  data: Record<string, unknown>; // 원본 데이터
  renderLabel?: () => React.ReactNode; // 커스텀 렌더링 함수 (optional)
}

export type { SuggestionProps, KeyDownProps, MentionSuggestionConfig, MentionConfig, UnifiedMentionItem };
