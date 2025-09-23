import { all, createLowlight } from 'lowlight';
import { MentionNode, CodeBlock } from '@/editor';
import { ImageUploadNode } from '@/editor/image/image-upload-node/image-upload-node-extension';
import { handleImageUpload, MAX_FILE_SIZE, type ListItemConfig } from '@/shared/utils';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import Mathematics, { migrateMathStrings } from '@tiptap/extension-mathematics';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { TableKit } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import { Color, TextStyleKit } from '@tiptap/extension-text-style';
import { Selection } from '@tiptap/extensions';
import { ReactNodeViewRenderer, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export const useWhiteEditor = <T>(mentionItems?: ListItemConfig<T>, contentClassName?: string) => {
  const lowlight = createLowlight(all);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        'aria-label': 'Editor Content',
        class: contentClassName || '',
      },
    },
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      TableKit.configure({
        table: { resizable: true },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Image,
      TextStyleKit,
      Color.configure({
        types: ['textStyle'],
      }),
      Highlight.configure({ multicolor: true }),
      Superscript,
      Subscript,
      Selection,
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlock as React.FC);
        },
      }).configure({ lowlight }),
      ImageUploadNode.configure({
        accept: 'image/*',
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => {
          console.error('Upload failed:', error);
        },
      }),
      Mathematics.configure({
        blockOptions: {},
        inlineOptions: {},
      }),
      ...(mentionItems ? [MentionNode(mentionItems)] : []),
    ],
    onCreate: ({ editor: currentEditor }) => {
      migrateMathStrings(currentEditor);
    },
    content: '',
    onUpdate: ({ editor: currentEditor }) => {
      console.log('onUpdate', currentEditor.getHTML());
    },
    onPaste(e, slice) {
      console.log('onPaste', e, slice);
    },
  });

  return { editor };
};
