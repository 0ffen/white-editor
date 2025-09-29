import type { ToolbarItem } from '@/white-editor';

export const defaultToolbarItems: ToolbarItem[][] = [
  ['undo', 'redo'],
  ['heading', 'bulletList', 'orderedList', 'blockquote'],
  ['bold', 'italic', 'strike', 'code', 'underline', 'color', 'highlight'],
  ['textAlignLeft', 'textAlignCenter', 'textAlignRight', 'textAlignJustify'],
  ['codeblock', 'inlineMath', 'blockMath'],
  ['link', 'table', 'image'],
];
