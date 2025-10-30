import type { MentionConfig, ToolbarItem, ToolbarItemProps } from '@/white-editor';
import type { EditorProps } from '@tiptap/pm/view';
import type { Content, JSONContent } from '@tiptap/react';

import type { Editor } from '@tiptap/react';

interface EditorExtensions<T = Record<string, unknown>> {
  mention?: MentionConfig<T>;
  character?: {
    show?: boolean;
    limit?: number;
    className?: string;
  };
  imageUpload?: {
    upload?: (file: File) => Promise<string>;
    onError?: (error: Error) => void;
    onSuccess?: (url: string) => void;
  };
}

interface WhiteEditorUIProps {
  editorClassName?: string;
  contentClassName?: string;
  toolbarItems?: ToolbarItem[][];
  toolbarProps?: ToolbarItemProps;
  theme?: 'light' | 'dark';
  footer?: React.ReactNode;
  disabled?: boolean;
  placeholder?: string;
}

interface WhiteEditorExtensions<T = Record<string, unknown>> {
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

interface UseWhiteEditorReturn {
  editor: Editor | null;
  charactersCount: number;
  getHTML: () => string;
  getJSON: () => JSONContent;
  getText: () => string;
  setContent: (content: string | JSONContent) => void;
  focus: () => void;
  blur: () => void;
  isEmpty: boolean;
  clear: () => void;
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

export type {
  WhiteEditorProps,
  WhiteEditorUIProps,
  WhiteEditorExtensions,
  UseWhiteEditorReturn,
  TipTapEditorOptions,
  EditorExtensions,
};
