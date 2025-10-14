import { useRef, useState } from 'react';
import type { JSONContent } from '@tiptap/react';
import { Button, createEmptyContent, ThemeToggle } from './shared';
import { cn } from './shared/utils';
import { WhiteEditor, WhiteViewer, type WhiteEditorRef } from './white-editor';

export default function App() {
  const [content, setContent] = useState<JSONContent>(createEmptyContent());
  const editorRef = useRef<WhiteEditorRef>(null);

  const handleSave = () => {
    // 버튼 클릭 시 ref.current를 통해 에디터의 메서드를 직접 호출합니다.
    if (editorRef.current) {
      const jsonData = editorRef.current.getJSON();
      console.log('에디터 JSON 데이터:', jsonData);

      // 에디터 내용 비우기
      editorRef.current.clear();
    }
  };

  const handleInsertText = () => {
    // TipTap Editor 인스턴스를 통한 직접 제어
    editorRef.current?.editor?.commands.insertContent('Hello World!');
  };

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
            ref={editorRef}
            disabled={false}
            editorClassName='we:h-[500px]!'
            contentClassName='we:h-full'
            onChange={() => {
              if (editorRef.current) {
                console.log(editorRef.current.getHTML());
                setContent(editorRef.current.getJSON());
              }
            }}
            extension={{
              mention: {
                data: [
                  { uuid: 1, name: 'White Lee', nickname: 'white' },
                  { uuid: 2, name: 'Black Kim', nickname: 'black' },
                  { uuid: 3, name: 'White Lee', nickname: 'white' },
                  { uuid: 4, name: 'Black Kim', nickname: 'black' },
                  { uuid: 5, name: 'White Lee', nickname: 'white' },
                  { uuid: 6, name: 'Black Kim', nickname: 'black' },
                  { uuid: 7, name: 'White Lee', nickname: 'white' },
                  { uuid: 8, name: 'Black Kim', nickname: 'black' },
                  { uuid: 9, name: 'White Lee', nickname: 'white' },
                  { uuid: 10, name: 'Black Kim', nickname: 'black' },
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
                <Button variant='default' className='we:w-fit' onClick={handleInsertText}>
                  저장
                </Button>
              </div>
            }
          />
        </section>

        <section className='we:space-y-3 we:h-fit'>
          <h2 className='we:mb-8 we:text-3xl we:font-bold we:text-center'>Viewer</h2>
          <WhiteViewer className='we:h-[400px] we:overflow-y-auto we:border we:rounded-md' content={content} />
        </section>
      </div>
    </main>
  );
}
