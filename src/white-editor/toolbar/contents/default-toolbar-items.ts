import type { ToolbarItem } from '@/white-editor';

export const defaultToolbarItems: ToolbarItem[][] = [
  ['undo', 'redo'],
  ['heading', 'bold', 'italic', 'strike', 'underline'],
  ['textAlignLeft', 'textAlignCenter', 'textAlignRight', 'textAlignJustify'],
  ['bulletList', 'orderedList', 'blockquote'],
  ['color', 'highlight', 'table', 'image', 'link'],
  ['codeblock', 'code', 'inlineMath', 'blockMath'],
];
