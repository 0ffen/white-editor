import { useState } from 'react';
import type { JSONContent } from '@tiptap/react';
import { Button, createEmptyContent, ThemeToggle } from './shared';
import { cn } from './shared/utils';
import { WhiteEditor, WhiteViewer } from './white-editor';

export default function App() {
  const [content, setContent] = useState<JSONContent>(createEmptyContent());

  return (
    <main className='we:p-6'>
      <div
        className={cn('we:w-full we:relative we:border-b we:flex we:items-center we:justify-center we:mb-8 we:pb-6')}
      >
        <h1 className='we:font-bold we:text-4xl'>White Editor</h1>
        <div className='we:w-fit we:right-0 we:absolute'>
          <ThemeToggle />
        </div>
      </div>

      <div className='we:grid we:grid-cols-1 we:gap-8 lg:we:grid-cols-2'>
        <section className='we:space-y-3'>
          <h2 className='we:mb-8 we:text-3xl we:font-bold we:text-center'>Editor</h2>
          <WhiteEditor
            editorClassName='we:h-[500px]!'
            contentClassName='we:h-full'
            onChange={setContent}
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
              },
            }}
            footer={
              <div className='we:flex we:justify-end'>
                <Button variant='default' className='we:w-fit'>
                  저장
                </Button>
              </div>
            }
          />
        </section>

        <section className='we:space-y-3 we:h-fit'>
          <h2 className='we:mb-8 we:text-3xl we:font-bold we:text-center'>Viewer</h2>
          <WhiteViewer className='we:rounded-md we:border we:h-[500px] we:overflow-y-auto' content={content} />
        </section>
      </div>
    </main>
  );
}
