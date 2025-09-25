import { ToolbarContainer, WhiteEditor } from './editor';
import { TooltipProvider } from './shared/components';
import { createListConfig, handleImageUpload } from './shared/utils';
import type { ImageUploadConfig } from './editor';

interface User {
  uuid: number;
  name: string;
  nickname: string;
}

const apiUsers: User[] = [
  { uuid: 1, name: '이름일', nickname: 'nickname1' },
  { uuid: 2, name: '이름이', nickname: 'nickname2' },
];

const userListConfig = createListConfig(apiUsers, {
  id: 'uuid',
  label: 'nickname',
});

export default function App() {
  return (
    <TooltipProvider>
      <main className='mx-auto flex flex-col gap-5 p-4'>
        <h1 className='text-2xl font-bold'>Editor</h1>
        {/* 뷰어, 에디터 분류 필요  */}
        <WhiteEditor
          // toolbar={toolbar}
          mentionItems={userListConfig}
          contentClassName='enki-editor'
          editorClassName='enki-editor-wrapper'
        />
      </main>
    </TooltipProvider>
  );
}

const imageUploadConfig: ImageUploadConfig = {
  accept: 'image/*',
  maxSize: 10 * 1024 * 1024, // 10MB
  limit: 5,
  upload: handleImageUpload,
  onError: (error) => {
    alert('업로드 실패: ' + error.message);
  },
};

const toolbar = ToolbarContainer({
  groups: [
    {
      undo: {
        show: true,
        props: {},
      },
      redo: {
        show: true,
        props: {},
      },
      heading: {
        show: true,
        props: {},
      },
      textAlignLeft: {
        show: true,
        props: {},
      },
      textAlignCenter: {
        show: true,
        props: {},
      },
      textAlignRight: {
        show: true,
        props: {},
      },
      textAlignJustify: {
        show: true,
        props: {},
      },
    },
    {
      bulletList: {
        show: true,
        props: {},
      },
      orderedList: {
        show: true,
        props: {},
      },
      bold: {
        show: true,
        props: {},
      },
      italic: {
        show: true,
        props: {},
      },
      strike: {
        show: true,
        props: {},
      },
      code: {
        show: true,
        props: {},
      },
      codeblock: {
        show: true,
        props: {},
      },
      underline: {
        show: true,
        props: {},
      },
      superscript: {
        show: true,
        props: {},
      },
      subscript: {
        show: true,
        props: {},
      },
      color: {
        show: true,
        props: {},
      },
      highlight: {
        show: true,
        props: {},
      },
      link: {
        show: true,
        props: {},
      },
      inlineMath: {
        show: true,
        props: {},
      },
      blockMath: {
        show: true,
        props: {},
      },
    },
    {
      imageUpload: {
        show: true,
        props: {
          imageConfig: imageUploadConfig,
        },
      },
      theme: true,
    },
  ],
});
