import type { ListItemConfig } from '@/shared/utils';

interface WhiteEditorProps<T> {
  mentionItems?: ListItemConfig<T>;
  toolbar?: React.ReactNode;
  editorClassName?: string;
  contentClassName?: string;
}

export type { WhiteEditorProps };
