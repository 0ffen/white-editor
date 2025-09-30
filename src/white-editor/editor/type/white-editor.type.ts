import type { ToolbarItem, ToolbarItemProps, MentionConfig } from '@/white-editor';
import type { EditorProps } from '@tiptap/pm/view';
import type { JSONContent, Content } from '@tiptap/react';
import type { Editor } from '@tiptap/react';

interface EditorExtensions<T> {
  mention?: MentionConfig<T>;
  character?: {
    show?: boolean;
    limit?: number;
    className?: string;
  };
}

interface WhiteEditorUIProps {
  editorClassName?: string;
  contentClassName?: string;
  toolbarItems?: ToolbarItem[][];
  toolbarProps?: ToolbarItemProps;
  theme?: 'light' | 'dark';
  footer?: React.ReactNode;
}

interface WhiteEditorExtensions<T> {
  extension?: EditorExtensions<T>;
}

interface TipTapEditorOptions {
  content?: Content;
  autofocus?: boolean | 'start' | 'end' | number;
  editable?: boolean;
  injectCSS?: boolean;
  injectNonce?: string;
  parseOptions?: Record<string, unknown>;
  enableInputRules?: boolean;
  enablePasteRules?: boolean;
  enableCoreExtensions?: boolean;
  immediatelyRender?: boolean;
  shouldRerenderOnTransaction?: boolean;
}

interface WhiteEditorProps<T> extends WhiteEditorUIProps, WhiteEditorExtensions<T>, TipTapEditorOptions {
  onChange?: (jsonContent: JSONContent) => void;
  onUpdate?: (jsonContent: JSONContent) => void;
  onBlur?: (jsonContent: JSONContent) => void;
  onFocus?: (jsonContent: JSONContent) => void;
  onCreate?: (editor: Editor) => void;
  onDestroy?: () => void;
  onSelectionUpdate?: (editor: Editor) => void;
  editorProps?: EditorProps;
}

export type { WhiteEditorProps, WhiteEditorUIProps, WhiteEditorExtensions, TipTapEditorOptions, EditorExtensions };
