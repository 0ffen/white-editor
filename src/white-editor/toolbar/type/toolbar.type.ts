import type { BlockquoteButtonProps } from '@/editor/nodes/blockquote';
import type { CodeBlockButtonProps } from '@/editor/nodes/code-block';
import type { ColorPopoverProps } from '@/editor/nodes/color';
import type { HeadingDropdownMenuProps } from '@/editor/nodes/heading';
import type { HighlightPopoverProps } from '@/editor/nodes/highlight';
import type { ImageDialogProps } from '@/editor/nodes/image';
import type { LinkPopoverProps } from '@/editor/nodes/link';
import type { ListButtonProps } from '@/editor/nodes/list';
import type { MarkButtonProps } from '@/editor/nodes/mark';
import type { MathPopoverProps } from '@/editor/nodes/mathematics';
import type { TableButtonProps } from '@/editor/nodes/table';
import type { TextAlignButtonProps } from '@/editor/nodes/text-align';
import type { UndoRedoButtonProps } from '@/editor/nodes/undo-redo';

export type ToolbarItem =
  | 'undo'
  | 'redo'
  | 'heading'
  | 'bulletList'
  | 'orderedList'
  | 'taskList'
  | 'blockquote'
  | 'codeblock'
  | 'bold'
  | 'italic'
  | 'strike'
  | 'underline'
  | 'code'
  | 'underline'
  | 'superscript'
  | 'subscript'
  | 'color'
  | 'highlight'
  | 'link'
  | 'table'
  | 'inlineMath'
  | 'blockMath'
  | 'image'
  | 'textAlignLeft'
  | 'textAlignCenter'
  | 'textAlignRight'
  | 'textAlignJustify'
  | 'theme';

export interface ToolbarItemProps {
  undo?: UndoRedoButtonProps;
  redo?: UndoRedoButtonProps;
  textAlignLeft?: TextAlignButtonProps;
  textAlignCenter?: TextAlignButtonProps;
  textAlignRight?: TextAlignButtonProps;
  textAlignJustify?: TextAlignButtonProps;
  bold?: MarkButtonProps;
  italic?: MarkButtonProps;
  strike?: MarkButtonProps;
  underline?: MarkButtonProps;
  code?: MarkButtonProps;
  superscript?: MarkButtonProps;
  subscript?: MarkButtonProps;
  heading?: HeadingDropdownMenuProps;
  bulletList?: ListButtonProps;
  orderedList?: ListButtonProps;
  taskList?: ListButtonProps;
  blockquote?: BlockquoteButtonProps;
  table?: TableButtonProps;
  image?: ImageDialogProps;
  link?: LinkPopoverProps;
  codeblock?: CodeBlockButtonProps;
  inlineMath?: MathPopoverProps;
  blockMath?: MathPopoverProps;
  color?: ColorPopoverProps;
  highlight?: HighlightPopoverProps;
}

export interface EditorToolbarConfig {
  undo?: {
    show: boolean;
    props?: UndoRedoButtonProps;
  };
  redo?: {
    show: boolean;
    props?: UndoRedoButtonProps;
  };
  heading?: {
    show: boolean;
    props?: HeadingDropdownMenuProps;
  };
  bulletList?: {
    show: boolean;
    props?: ListButtonProps;
  };
  orderedList?: {
    show: boolean;
    props?: ListButtonProps;
  };
  taskList?: {
    show: boolean;
    props?: ListButtonProps;
  };
  blockquote?: {
    show: boolean;
    props?: BlockquoteButtonProps;
  };
  codeblock?: {
    show: boolean;
    props?: CodeBlockButtonProps;
  };
  bold?: {
    show: boolean;
    props?: MarkButtonProps;
  };
  italic?: {
    show: boolean;
    props?: MarkButtonProps;
  };
  strike?: {
    show: boolean;
    props?: MarkButtonProps;
  };
  code?: {
    show: boolean;
    props?: MarkButtonProps;
  };
  underline?: {
    show: boolean;
    props?: MarkButtonProps;
  };
  superscript?: {
    show: boolean;
    props?: MarkButtonProps;
  };
  subscript?: {
    show: boolean;
    props?: MarkButtonProps;
  };
  color?: {
    show: boolean;
    props?: ColorPopoverProps;
  };
  highlight?: {
    show: boolean;
    props?: HighlightPopoverProps;
  };
  link?: {
    show: boolean;
    props?: LinkPopoverProps;
  };
  table?: {
    show: boolean;
    props?: TableButtonProps;
  };
  inlineMath?: {
    show: boolean;
    props?: MathPopoverProps;
  };
  blockMath?: {
    show: boolean;
    props?: MathPopoverProps;
  };
  textAlignLeft?: {
    show: boolean;
    props?: TextAlignButtonProps;
  };
  textAlignCenter?: {
    show: boolean;
    props?: TextAlignButtonProps;
  };
  textAlignRight?: {
    show: boolean;
    props?: TextAlignButtonProps;
  };
  textAlignJustify?: {
    show: boolean;
    props?: TextAlignButtonProps;
  };
  image?: {
    show: boolean;
    props?: ImageDialogProps;
  };
  theme?: boolean;
}
