import { all, createLowlight } from 'lowlight';
import { type ListItemConfig } from '@/shared/utils';
import { MentionNode, ResizableImage, CodeBlock } from '@/white-editor';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Highlight from '@tiptap/extension-highlight';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import Mathematics, { migrateMathStrings } from '@tiptap/extension-mathematics';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { TableKit } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import { Color, TextStyleKit } from '@tiptap/extension-text-style';
import { Selection } from '@tiptap/extensions';
import { ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface ExtensionOptions<T> {
  mentionItems?: ListItemConfig<T>;
  readOnly?: boolean;
}

export function createExtensions<T>(options: ExtensionOptions<T> = {}) {
  const { mentionItems, readOnly = false } = options;
  const lowlight = createLowlight(all);

  return [
    StarterKit.configure({
      link: {
        openOnClick: readOnly,
        enableClickSelection: true,
      },
    }),
    TableKit.configure({
      table: { resizable: !readOnly },
    }),
    TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
    TaskList,
    TaskItem.configure({ nested: true }),
    ResizableImage,
    TextStyleKit,
    Color,
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
  return createExtensions({ readOnly: true });
}

// 에디터 전용 extensions 생성 함수
export function createEditorExtensions<T>(mentionItems?: ListItemConfig<T>) {
  return createExtensions({ mentionItems, readOnly: false });
}

// Math migration
export { migrateMathStrings };
