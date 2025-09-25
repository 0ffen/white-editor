import type { BlockquoteButtonProps } from '@/editor/blockquote';
import type { CodeBlockButtonProps } from '@/editor/code-block';
import type { ColorPopoverProps } from '@/editor/color';
import type { HeadingDropdownMenuProps } from '@/editor/heading';
import type { HighlightPopoverProps } from '@/editor/highlight';
import type { ImageDialogProps } from '@/editor/image';
import type { LinkPopoverProps } from '@/editor/link';
import type { ListButtonProps } from '@/editor/list';
import type { MarkButtonProps } from '@/editor/mark';
import type { MathPopoverProps } from '@/editor/mathematics';
import type { TableButtonProps } from '@/editor/table';
import type { TextAlignButtonProps } from '@/editor/text-align';
import type { UndoRedoButtonProps } from '@/editor/undo-redo';

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
  imageUpload?: {
    show: boolean;
    props?: ImageDialogProps;
  };
  theme?: boolean;
}
