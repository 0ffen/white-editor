import { SimpleEditor } from '@/templates/simple/simple-editor';
import { TooltipProvider } from './components';
import { ToolbarContainer } from './editor';
import { createListConfig } from './utils';
import type { HeadingOption } from './editor/heading/type/heading.type';

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

const HeadingOptions: HeadingOption[] = [
  {
    label: 'Nor Text',
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

const toolbar = ToolbarContainer({
  groups: [
    {
      undo: true,
      redo: true,
      heading: {
        options: HeadingOptions,
      },
      textAlign: ['left', 'center', 'right'],
    },
    {
      list: ['bulletList', 'orderedList'],
      marks: ['bold', 'italic', 'strike'],
      color: true,
      link: true,
    },
    {
      imageUpload: true,
      theme: true,
    },
  ],
});

export default function App() {
  return (
    <TooltipProvider>
      <main className='mx-auto flex flex-col gap-5 p-4'>
        <h1 className='text-2xl font-bold'>Editor</h1>
        <SimpleEditor mentionItems={userListConfig} />
      </main>
    </TooltipProvider>
  );
}
