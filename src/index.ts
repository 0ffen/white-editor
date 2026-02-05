'use client';

import './shared/styles/index.css';

//editor, viewer
export { WhiteEditor, useWhiteEditor, WhiteViewer, WhiteEditorThemeProvider } from './white-editor';

//toolbar types & preset items (toolbar-items.ts)
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
} from './white-editor';

export { WHITE_EDITOR_TOOLBAR_ITEMS, DEFAULT_TOOLBAR_ITEMS, MINIMAL_TOOLBAR_ITEMS } from './white-editor';

//editor types
export type {
  WhiteEditorProps,
  WhiteEditorUIProps,
  WhiteEditorExtensions,
  TipTapEditorOptions,
  EditorExtensions,
  WhiteEditorRef,
  UseWhiteEditorReturn,
} from './white-editor';

//tiptap
export type { JSONContent } from '@tiptap/react';
export type { Editor } from '@tiptap/react';

// TipTap Extensions - 사용자가 별도 설치 없이 사용할 수 있도록 re-export
// 자주 사용되는 extensions를 라이브러리에서 제공
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

// TipTap Core - 커스텀 노드를 만들 때 필요한 유틸리티
export { Node } from '@tiptap/core';
export { ReactNodeViewRenderer, NodeViewContent, NodeViewWrapper } from '@tiptap/react';
