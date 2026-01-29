import type { ToolbarItem } from '@/white-editor';

export const defaultToolbarItems: ToolbarItem[][] = [
  ['undo', 'redo'],
  ['heading', 'bulletList', 'orderedList', 'blockquote'],
  ['bold', 'italic', 'strike', 'code', 'underline', 'color', 'highlight'],
  ['textAlignLeft', 'textAlignCenter', 'textAlignRight', 'textAlignJustify'],
  ['codeblock', 'inlineMath', 'blockMath'],
  ['link', 'table', 'image'],
];

export const offenDefaultToolbarItems: ToolbarItem[][] = [
  ['heading'],
  ['color'],
  ['bold', 'italic', 'strike', 'underline', 'highlight', 'link'],
  ['code', 'codeblock'],
  ['blockquote', 'bulletList', 'orderedList'],
  ['table'],
  ['image'],
  ['textAlignLeft', 'textAlignCenter', 'textAlignRight'],
];

export const minimalToolbarItems: ToolbarItem[][] = [
  ['heading', 'color'],
  ['blockquote', 'bulletList', 'orderedList'],
  ['table'],
  ['image'],
  ['textAlignLeft', 'textAlignCenter', 'textAlignRight'],
];
