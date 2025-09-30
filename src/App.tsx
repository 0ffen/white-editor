import { useState } from 'react';
import type { JSONContent } from '@tiptap/react';
import { Button, createEmptyContent } from './shared';
import { EditorViewer, WhiteEditor } from './white-editor';

export default function App() {
  const [content, setContent] = useState<JSONContent>(createEmptyContent());

  return (
    <main className='p-6'>
      <h1 className='mb-8 border-b pb-6 text-center text-4xl font-bold italic'>White Editor</h1>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        <section className='space-y-3'>
          <h2 className='mb-8 text-center text-3xl font-bold italic'>Editor</h2>
          <WhiteEditor
            editorClassName='!h-[500px]'
            contentClassName='h-full'
            onChange={(content) => {
              setContent(content);
            }}
            extension={{
              mention: {
                listData: [
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
          <h2 className='mb-8 text-center text-3xl font-bold italic'>Viewer</h2>
          <EditorViewer className='h-[500px] rounded-md border' content={content} key={JSON.stringify(content)} />
        </section>
      </div>
    </main>
  );
}
