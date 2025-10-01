import { useState } from 'react';
import type { JSONContent } from '@tiptap/react';
import { Button, createEmptyContent, ThemeToggle, useDebounce } from './shared';
import { WhiteEditor, WhiteViewer } from './white-editor';

export default function App() {
  const [content, setContent] = useState<JSONContent>(createEmptyContent());

  const debouncedSetContent = useDebounce((newContent: JSONContent) => {
    setContent(newContent);
  }, 300);

  return (
    <main className='p-6'>
      <h1 className='mb-8 border-b pb-6 text-center text-4xl font-bold italic'>White Editor</h1>
      <div className='absolute top-8 right-16 w-fit justify-end'>
        <ThemeToggle />
      </div>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        <section className='space-y-3'>
          <h2 className='mb-8 text-center text-3xl font-bold'>Editor</h2>
          <WhiteEditor
            editorClassName='!h-[500px]'
            contentClassName='h-full'
            onChange={debouncedSetContent}
            extension={{
              mention: {
                data: [
                  { uuid: 1, name: 'White Lee', nickname: 'white' },
                  { uuid: 2, name: 'Black Kim', nickname: 'black' },
                ],
                id: 'uuid',
                label: 'nickname',
              },
              character: {
                show: true,
                limit: 100,
              },
            }}
            footer={
              <div className='flex justify-end'>
                <Button variant='default' className='w-fit'>
                  저장
                </Button>
              </div>
            }
          />
        </section>

        <section className='space-y-3'>
          <h2 className='mb-8 text-center text-3xl font-bold'>Viewer</h2>
          <WhiteViewer className='h-[500px] rounded-md border' content={content} key={JSON.stringify(content)} />
        </section>
      </div>
    </main>
  );
}
