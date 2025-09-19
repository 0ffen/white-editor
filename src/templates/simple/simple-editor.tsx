import * as React from 'react';

import { Toolbar, ToolbarGroup, ToolbarSeparator } from '@/components';
import { Spacer } from '@/components';

import { HorizontalRule } from '@/package/extensions';
import {
  BlockquoteButton,
  CodeBlockButton,
  ImageUploadButton,
  LinkPopover,
  ListButton,
  MarkButton,
  TextAlignButton,
  UndoRedoButton,
} from '@/package/toolbar';
import { HeadingDropdownMenu } from '@/package/toolbar/heading/heading-dropdown-menu';
import type { HeadingOption } from '@/package/toolbar/heading/heading.type';
import { ImageUploadNode } from '@/package/toolbar/image/image-upload-node/image-upload-node-extension';
import { TableButton } from '@/package/toolbar/table/table-button';
import { handleImageUpload, MAX_FILE_SIZE } from '@/utils';
import { Image } from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TableCell, TableHeader, TableKit, TableRow } from '@tiptap/extension-table';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { Selection } from '@tiptap/extensions';
import { EditorContent, EditorContext, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';

import { ThemeToggle } from './theme-toggle';

import './simple-editor.css';

const MainToolbarContent = () => {
  const HeadingOptions: HeadingOption[] = [
    {
      label: 'Normal Text',
      level: null,
    },
    {
      label: 'Heading 1',
      level: 1,
    },
    {
      label: 'Heading 2',
      level: 2,
    },
    {
      label: 'Heading 3',
      level: 3,
    },
  ];

  return (
    <div className='toolbar-wrapper'>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action='undo' />
        <UndoRedoButton action='redo' />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu options={HeadingOptions} />
        <ListButton type='bulletList' />
        <ListButton type='orderedList' />
        <ListButton type='taskList' />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type='bold' />
        <MarkButton type='italic' />
        <MarkButton type='strike' />
        <MarkButton type='code' />
        <MarkButton type='underline' />
        <LinkPopover />
        <TableButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type='superscript' />
        <MarkButton type='subscript' />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align='left' />
        <TextAlignButton align='center' />
        <TextAlignButton align='right' />
        <TextAlignButton align='justify' />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton />
      </ToolbarGroup>
      <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup>
      <Spacer />
    </div>
  );
};

export function SimpleEditor() {
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
      TableRow,
      TableHeader,
      TableCell,
      HorizontalRule,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: 'image/*',
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error('Upload failed:', error),
      }),
    ],
    content: `
    <table>
      <tbody>
        <tr>
          <th>Name</th>
          <th colspan="3">Description</th>
        </tr>
        <tr>
          <td>Cyndi Lauper</td>
          <td>Singer</td>
          <td>Songwriter</td>
          <td>Actress</td>
        </tr>
      </tbody>
    </table>
  `,
  });

  return (
    <div className='editor-wrapper'>
      <EditorContext.Provider value={{ editor }}>
        <Toolbar ref={toolbarRef} role='toolbar'>
          <MainToolbarContent />
        </Toolbar>

        <EditorContent editor={editor} className='markdown prose dark:prose-invert max-w-full' />
      </EditorContext.Provider>
    </div>
  );
}
