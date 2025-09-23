import type { HeadingOption } from '@/editor/heading';

export interface EditorToolbarConfig {
  undo?: boolean;
  redo?: boolean;
  heading?: {
    options: HeadingOption[];
  };
  list?: Array<'bulletList' | 'orderedList' | 'taskList'>;
  blockquote?: boolean;
  codeblock?: boolean;
  marks?: Array<'bold' | 'italic' | 'strike' | 'code' | 'underline' | 'superscript' | 'subscript'>;
  color?: boolean;
  highlight?: boolean;
  link?: boolean;
  table?: boolean;
  math?: Array<'inline' | 'block'>;
  textAlign?: Array<'left' | 'center' | 'right' | 'justify'>;
  imageUpload?: boolean;
  theme?: boolean;
}
