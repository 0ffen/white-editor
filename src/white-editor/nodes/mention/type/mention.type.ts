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
  listData: T[];
  id: keyof T;
  label: keyof T;
}

export type { SuggestionProps, KeyDownProps, MentionSuggestionConfig, MentionConfig };
