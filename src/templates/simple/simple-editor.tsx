import * as React from 'react';

import { all, createLowlight } from 'lowlight';

import { Toolbar } from '@/components';
import { Spacer } from '@/components';

import { CodeBlock, MentionNode, DefaultToolbar } from '@/editor';
import { ImageUploadNode } from '@/editor/image/image-upload-node/image-upload-node-extension';
import { handleImageUpload, MAX_FILE_SIZE, type ListItemConfig } from '@/utils';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Highlight } from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { migrateMathStrings, Mathematics } from '@tiptap/extension-mathematics';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TableKit } from '@tiptap/extension-table';
import { TextAlign } from '@tiptap/extension-text-align';
import { Color, TextStyleKit } from '@tiptap/extension-text-style';
import { Selection } from '@tiptap/extensions';
import { EditorContent, EditorContext, ReactNodeViewRenderer, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
export { createListConfig } from '@/utils';

import './simple-editor.css';

const lowlight = createLowlight(all);

interface SimpleEditorProps<T> {
  mentionItems?: ListItemConfig<T>;
  toolbar?: React.ReactNode;
}

export function SimpleEditor<T>({ mentionItems, toolbar }: SimpleEditorProps<T>) {
  const toolbarRef = React.useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        'aria-label': 'Main content area, start typing to enter text.',
        class: 'enki-editor', //에디터에 적용할 스타일 클래스 네임 입력
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
    content: `
  `,
  });

  return (
    <div className='editor-wrapper'>
      <EditorContext.Provider value={{ editor }}>
        <Toolbar ref={toolbarRef} role='toolbar'>
          {toolbar ? (
            <div className='toolbar-wrapper'>
              <Spacer />
              {toolbar}
              <Spacer />
            </div>
          ) : (
            <DefaultToolbar />
          )}
        </Toolbar>

        <EditorContent editor={editor} className='markdown prose dark:prose-invert max-w-full' />
      </EditorContext.Provider>
    </div>
  );
}
