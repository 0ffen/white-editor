import { useRef, useState } from 'react';
import type { JSONContent } from '@tiptap/react';
import { Button, createEmptyContent, ThemeToggle } from './shared';
import { cn } from './shared/utils';
import { WhiteEditor, WhiteViewer, type WhiteEditorRef } from './white-editor';

export default function App() {
  const [content, setContent] = useState<JSONContent>(createEmptyContent());
  const editorRef = useRef<WhiteEditorRef>(null);

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

  /**
   * 옵션 1: Mock 이미지 업로드 함수 - 서버 업로드 시뮬레이션
   */
  const handleImageUpload = async (file: File): Promise<string> => {
    // 1. 파일 유효성 검사
    if (!file.type.startsWith('image/')) {
      throw new Error('이미지 파일만 업로드 가능합니다');
    }

    // 2. 파일 크기 제한 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('파일 크기는 5MB 이하여야 합니다');
    }

    // 3. 업로드 시뮬레이션 (1-2초 지연)
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    // 4. 서버 업로드 시뮬레이션 - 실제 서버 URL 반환
    // 실제로는 서버에서 반환된 URL을 사용해야 합니다
    const mockServerUrl = `https://example.com/uploads/${Date.now()}-${file.name}`;

    // eslint-disable-next-line no-console
    console.log('📤 이미지 업로드 완료 (서버 시뮬레이션):', {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)}KB`,
      fileType: file.type,
      url: mockServerUrl,
    });

    return mockServerUrl;
  };

  /**
   * 실제 백엔드 API 사용 예시
   * 위의 Mock 함수 대신 이 함수를 사용하려면 주석을 해제하고 위의 함수를 주석 처리하세요
   */
  /*
  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://your-api.com/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '업로드 실패');
    }

    const data = await response.json();
    return data.url; // 서버에서 반환된 이미지 URL
  };
  */

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
                limit: 1000,
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
              <div className='we:flex we:justify-end we:gap-2'>
                <Button variant='secondary' className='we:w-fit' onClick={handleInsertText}>
                  텍스트 삽입
                </Button>
                <Button variant='secondary' className='we:w-fit' onClick={handleInsertFailedImage}>
                  실패 이미지 삽입
                </Button>
                <Button variant='secondary' className='we:w-fit' onClick={handleClear}>
                  초기화
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
