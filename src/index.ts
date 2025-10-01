import './shared/styles/index.css';
import './shared/styles/editor.css';
import './shared/styles/markdown.css';
import './shared/styles/github-dark.css';

//editor, viewer
export { WhiteEditor, useWhiteEditor, WhiteViewer } from './white-editor';

//toolbar types
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

//editor types
export type {
  WhiteEditorProps,
  WhiteEditorUIProps,
  WhiteEditorExtensions,
  TipTapEditorOptions,
  EditorExtensions,
} from './white-editor';

//tiptap
export type { JSONContent } from '@tiptap/react';
export type { Editor } from '@tiptap/react';

//utils
export { getHtmlContent, createEmptyContent, setCSSVariables } from './shared/utils';
