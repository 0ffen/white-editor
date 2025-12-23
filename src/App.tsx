import { useRef, useState } from 'react';
import type { JSONContent } from '@tiptap/react';
import { Button, createEmptyContent, ThemeToggle } from './shared';
import { cn } from './shared/utils';
import { WhiteEditor, WhiteViewer, type WhiteEditorRef } from './white-editor';

export default function App() {
  const [content, setContent] = useState<JSONContent>(createEmptyContent());
  const editorRef = useRef<WhiteEditorRef>(null);

  const pageLinksData = [
    {
      id: '1',
      title: 'v2.0 콜렉션 - 경고',
      href: 'https://white-platform.com/pages/v2-collection-warning',
      path: '/pages/v2-collection-warning',
    },
    {
      id: '2',
      title: 'v2.0 프로젝트 상세 - 이슈 생성/수정',
      href: 'https://white-platform.com/pages/v2-project-detail',
      path: '/pages/v2-project-detail',
    },
  ];

  const handleClear = () => {
    if (editorRef.current) {
      editorRef.current.clear();
    }
  };

  const handleInsertText = () => {
    editorRef.current?.editor?.commands.insertContent('Hello World!');
  };

  const handleInsertFailedImage = () => {
    editorRef.current?.editor?.commands.setResizableImage({
      src: 'https://invalid-url-that-will-fail.example.com/image.jpg',
      alt: 'Failed Image',
      caption: '이미지 로드 실패 예시',
    });
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    if (!file.type.startsWith('image/')) {
      throw new Error('이미지 파일만 업로드 가능합니다');
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('파일 크기는 5MB 이하여야 합니다');
    }

    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));
    const mockServerUrl = `https://example.com/uploads/${Date.now()}-${file.name}`;

    // eslint-disable-next-line no-console
    console.log('📤 이미지 업로드 완료:', mockServerUrl);

    return mockServerUrl;
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
            placeholder='여기에 텍스트를 입력하세요...'
            showToolbar={true}
            onChange={() => {
              if (editorRef.current) {
                setContent(editorRef.current.getJSON());
              }
            }}
            extension={{
              mention: {
                data: [
                  { uuid: 1, name: 'White Lee', nickname: 'white' },
                  { uuid: 2, name: 'Black Kim', nickname: 'black' },
                ],
                id: 'uuid',
                label: 'nickname',
              },
              pageMention: {
                data: pageLinksData,
                id: 'id',
                title: 'title',
                href: 'href',
                path: 'path',
              },
              character: {
                show: true,
              },
              imageUpload: {
                upload: handleImageUpload,
                onSuccess: (url) => {
                  // eslint-disable-next-line no-console
                  console.log('✅ 이미지 업로드 성공:', url);
                },
                onError: (error) => {
                  // eslint-disable-next-line no-console
                  console.error('❌ 이미지 업로드 실패:', error.message);
                },
              },
            }}
            footer={
              <div className='we:flex we:flex-col we:gap-2'>
                <div className='we:flex we:justify-end we:gap-2'>
                  <Button type='button' variant='secondary' className='we:w-fit' onClick={handleInsertText}>
                    텍스트 삽입
                  </Button>
                  <Button type='button' variant='secondary' className='we:w-fit' onClick={handleInsertFailedImage}>
                    실패 이미지 삽입
                  </Button>
                  <Button type='button' variant='secondary' className='we:w-fit' onClick={handleClear}>
                    초기화
                  </Button>
                </div>
                <div className='we:flex we:justify-end we:gap-2 we:border-t we:pt-2 we:my-2'>
                  <span className='we:text-sm we:text-muted-foreground we:mr-2'>
                    @ 입력하여 사람 및 페이지 링크 검색
                  </span>
                </div>
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
