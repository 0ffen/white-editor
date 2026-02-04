import type { ToolbarItem } from '../type/toolbar.type';

export const WHITE_EDITOR_TOOLBAR_ITEMS: ToolbarItem[][] = [
  ['undo', 'redo'],
  ['heading', 'bulletList', 'orderedList', 'blockquote'],
  ['bold', 'italic', 'strike', 'code', 'underline', 'color', 'highlight'],
  ['textAlignLeft', 'textAlignCenter', 'textAlignRight', 'textAlignJustify'],
  ['codeblock', 'inlineMath', 'blockMath'],
  ['link', 'table', 'image'],
];

export const DEFAULT_TOOLBAR_ITEMS: ToolbarItem[][] = [
  ['heading'],
  ['color'],
  ['bold', 'italic', 'strike', 'underline', 'highlight', 'link'],
  ['code', 'codeblock'],
  ['blockquote', 'bulletList', 'orderedList'],
  ['table'],
  ['image'],
  ['textAlignLeft', 'textAlignCenter', 'textAlignRight'],
];

export const MINIMAL_TOOLBAR_ITEMS: ToolbarItem[][] = [
  ['heading', 'color'],
  ['blockquote', 'bulletList', 'orderedList'],
  ['table'],
  ['image'],
  ['textAlignLeft', 'textAlignCenter', 'textAlignRight'],
];
