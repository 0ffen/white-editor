'use client';

/**
 * Editor 전용 진입점.
 * import { WhiteEditor, useWhiteEditor, ... } from '@0ffen/white-editor/editor'
 */
import '@/shared/styles/index.css';

export { WhiteEditor, useWhiteEditor, WhiteEditorThemeProvider } from '@/white-editor';

export type {
  BlockquoteButtonProps,
  CodeBlockButtonProps,
  ColorPopoverProps,
  HeadingDropdownMenuProps,
  HighlightPopoverProps,
  ImageDialogProps,
  LinkPopoverProps,
  ListButtonProps,
  MarkButtonProps,
  MathPopoverProps,
  TableButtonProps,
  TextAlignButtonProps,
  UndoRedoButtonProps,
  ToolbarItem,
  ToolbarItemProps,
  EditorToolbarConfig,
} from '@/white-editor';

export { WHITE_EDITOR_TOOLBAR_ITEMS, DEFAULT_TOOLBAR_ITEMS, MINIMAL_TOOLBAR_ITEMS } from '@/white-editor';

export type {
  WhiteEditorProps,
  WhiteEditorUIProps,
  WhiteEditorExtensions,
  TipTapEditorOptions,
  EditorExtensions,
  WhiteEditorRef,
  UseWhiteEditorReturn,
} from '@/white-editor';

export type { JSONContent } from '@tiptap/react';
export type { Editor } from '@tiptap/react';

export { default as Placeholder } from '@tiptap/extension-placeholder';
export { default as Highlight } from '@tiptap/extension-highlight';
export { default as Subscript } from '@tiptap/extension-subscript';
export { default as Superscript } from '@tiptap/extension-superscript';
export { default as TextAlign } from '@tiptap/extension-text-align';
export { default as Link } from '@tiptap/extension-link';
export { default as Image } from '@tiptap/extension-image';
export { default as HorizontalRule } from '@tiptap/extension-horizontal-rule';
export { Table, TableRow, TableCell } from '@tiptap/extension-table';
export { TaskList, TaskItem } from '@tiptap/extension-list';
export { default as Mention } from '@tiptap/extension-mention';
export { default as Mathematics } from '@tiptap/extension-mathematics';
export { default as StarterKit } from '@tiptap/starter-kit';
export { CharacterCount, Selection } from '@tiptap/extensions';

export { Node } from '@tiptap/core';
export { ReactNodeViewRenderer, NodeViewContent, NodeViewWrapper } from '@tiptap/react';
