import type { ListItemConfig } from '@/utils';

interface WhiteEditorProps<T> {
  mentionItems?: ListItemConfig<T>;
  toolbar?: React.ReactNode;
  editorClassName?: string;
  contentClassName?: string;
}

export type { WhiteEditorProps };
