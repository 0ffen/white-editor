import type { RefObject } from 'react';
import { all, createLowlight } from 'lowlight';
import { MentionNode, CodeBlock, ResizableImage, CustomTableHeader, type MentionConfig } from '@/white-editor';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Highlight from '@tiptap/extension-highlight';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import Mathematics, { migrateMathStrings } from '@tiptap/extension-mathematics';
import Mention from '@tiptap/extension-mention';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table, TableCell, TableRow } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { Selection, CharacterCount } from '@tiptap/extensions';
import { ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// 에디터 전용 extensions
export function createEditorExtensions<T>(
  mentionDataRef?: RefObject<MentionConfig<T> | undefined>,
  maxCharacters?: number
) {
  const lowlight = createLowlight(all);

  return [
    StarterKit.configure({
      codeBlock: false,
      link: {
        openOnClick: false,
        enableClickSelection: true,
      },
    }),
    CharacterCount.configure({
      limit: maxCharacters || null,
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    CustomTableHeader,
    TableCell,
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
        if (typeof window === 'undefined') {
          return null;
        }
        return ReactNodeViewRenderer(CodeBlock as React.FC);
      },
    }).configure({ lowlight, enableTabIndentation: true }),
    Mathematics.configure({
      blockOptions: {},
      inlineOptions: {},
    }),
    ...(mentionDataRef ? [MentionNode({ mentionDataRef })] : []),
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
        enableClickSelection: false,
      },
    }),
    Table.configure({
      resizable: false,
      allowTableNodeSelection: false,
    }),
    TableRow,
    CustomTableHeader,
    TableCell,
    TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
    TaskList,
    TaskItem.configure({
      nested: true,
      onReadOnlyChecked: () => false,
    }),
    ResizableImage,
    TextStyleKit,
    Highlight.configure({ multicolor: true }),
    Superscript,
    Subscript,
    CodeBlockLowlight.extend({
      readonly: true,
      addNodeView() {
        if (typeof window === 'undefined') return null;
        return ReactNodeViewRenderer(CodeBlock as React.FC);
      },
    }).configure({ lowlight }),
    Mathematics.configure({
      blockOptions: {},
      inlineOptions: {},
    }),
    Mention.configure({
      HTMLAttributes: {
        contenteditable: 'false',
      },
    }),
  ];
}

// Math migration
export { migrateMathStrings };
