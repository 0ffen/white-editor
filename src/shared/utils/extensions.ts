import { all, createLowlight } from 'lowlight';
import { type ListItemConfig } from '@/shared/utils';
import { MentionNode, CodeBlock, ResizableImage } from '@/white-editor';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Highlight from '@tiptap/extension-highlight';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import Mathematics, { migrateMathStrings } from '@tiptap/extension-mathematics';
import Mention from '@tiptap/extension-mention';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { TableKit } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { Selection } from '@tiptap/extensions';
import { ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// 에디터 전용 extensions
export function createEditorExtensions<T>(mentionItems?: ListItemConfig<T>) {
  const lowlight = createLowlight(all);

  return [
    StarterKit.configure({
      codeBlock: false,
      link: {
        openOnClick: false,
        enableClickSelection: true,
      },
    }),
    TableKit.configure({
      table: { resizable: true },
    }),
    TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
    TaskList,
    TaskItem.configure({ nested: true }),
    ResizableImage,
    TextStyleKit,
    Highlight.configure({ multicolor: true }),
    Superscript,
    Subscript,
    Selection,
    CodeBlockLowlight.extend({
      addNodeView() {
        return ReactNodeViewRenderer(CodeBlock as React.FC);
      },
    }).configure({ lowlight }),
    Mathematics.configure({
      blockOptions: {},
      inlineOptions: {},
    }),
    ...(mentionItems ? [MentionNode(mentionItems)] : []),
  ];
}

// 뷰어 전용 extensions (read-only)
export function createViewerExtensions() {
  const lowlight = createLowlight(all);

  return [
    StarterKit.configure({
      codeBlock: false,
      link: {
        openOnClick: true,
        enableClickSelection: true,
      },
    }),
    TableKit.configure({
      table: { resizable: false },
    }),
    TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
    TaskList,
    TaskItem.configure({ nested: true }),
    ResizableImage,
    TextStyleKit,
    Highlight.configure({ multicolor: true }),
    Superscript,
    Subscript,
    Selection,
    CodeBlockLowlight.extend({
      addNodeView() {
        return ReactNodeViewRenderer(CodeBlock as React.FC);
      },
    }).configure({ lowlight }),
    Mathematics.configure({
      blockOptions: {},
      inlineOptions: {},
    }),
    Mention.configure({}),
  ];
}

// Math migration
export { migrateMathStrings };
