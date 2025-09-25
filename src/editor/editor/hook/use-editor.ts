import { all, createLowlight } from 'lowlight';
import { CodeBlock } from '@/editor/code-block/ui/code-block';
import { ImageUploadNode } from '@/editor/image/image-upload-node/image-upload-node-extension';
import { MentionNode } from '@/editor/mention/util/mention-node';
import { handleImageUpload, MAX_FILE_SIZE } from '@/shared/utils';

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
import type { WhiteEditorProps } from '../type/white-editor.type';

export const useWhiteEditor = <T>(props: WhiteEditorProps<T>) => {
  const { mentionItems, contentClassName, imageConfig } = props;
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
        accept: imageConfig?.accept || 'image/*',
        maxSize: imageConfig?.maxSize || MAX_FILE_SIZE,
        limit: imageConfig?.limit || 1,
        upload: imageConfig?.upload || handleImageUpload,
        onError:
          imageConfig?.onError ||
          ((error) => {
            console.error('Upload failed:', error);
          }),
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
  });

  return { editor };
};
