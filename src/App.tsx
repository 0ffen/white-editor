import { useRef, useState } from 'react';
import { CheckIcon } from 'lucide-react';
import type { JSONContent } from '@tiptap/react';
import {
  Button,
  createEmptyContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ThemeToggle,
  TooltipProvider,
} from './shared';
import { cn, i18n } from './shared/utils';
import {
  WHITE_EDITOR_TOOLBAR_ITEMS,
  WhiteEditor,
  WhiteEditorThemeProvider,
  WhiteViewer,
  type WhiteEditorRef,
} from './white-editor';

type Locale = 'ko' | 'en' | 'es';

export default function App() {
  const [content, setContent] = useState<JSONContent>(createEmptyContent());
  const [viewerKey, setViewerKey] = useState(0);
  const [locale, setLocale] = useState<Locale>('ko');
  const [editorEmpty, setEditorEmpty] = useState(true);
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

  const handleTransformToViewer = () => {
    const json = editorRef.current?.getJSON();
    setContent(json ?? createEmptyContent());
    setViewerKey((k) => k + 1);
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

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('파일 크기는 10MB 이하여야 합니다');
    }

    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    const logoUrl = '/white.png';

    return logoUrl;
  };

  return (
    <TooltipProvider>
      <main className='we:p-6'>
        <div
          className={cn('we:w-full we:relative we:border-b we:flex we:items-center we:justify-center we:mb-8 we:pb-6')}
        >
          <h1 className='we:font-bold we:text-4xl'>White Editor</h1>
          <div className='we:absolute we:right-0 we:flex we:w-fit we:items-center we:gap-3'>
            <Select
              value={locale}
              onValueChange={(value) => {
                const next = value as Locale;
                void i18n.changeLanguage(next).then(() => setLocale(next));
              }}
            >
              <SelectTrigger className='we:w-[120px]'>
                <SelectValue placeholder='Locale' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ko'>한국어</SelectItem>
                <SelectItem value='en'>English</SelectItem>
                <SelectItem value='es'>Español</SelectItem>
              </SelectContent>
            </Select>
            <ThemeToggle />
          </div>
        </div>

        <div className='we:grid we:grid-cols-2 we:gap-8'>
          <section className='we:space-y-3'>
            <h2 className='we:mb-8 we:text-3xl we:font-bold we:text-center'>Editor</h2>
            <WhiteEditorThemeProvider
              theme={{
                mode: 'light',
                colors: {},
                zIndex: {},
              }}
            >
              <WhiteEditor
                placeholder='내용을 입력해주세요.'
                key={locale}
                locale={locale}
                ref={editorRef}
                disabled={false}
                onEmptyChange={setEditorEmpty}
                editorClassName='we:h-[1000px] we:rounded-md we:border we:border-border-default'
                contentClassName='we:h-full we:px-2'
                toolbarItems={WHITE_EDITOR_TOOLBAR_ITEMS}
                toolbarProps={{
                  image: {
                    icon: <CheckIcon className='we:w-4 we:h-4' />, // UI만
                    className: 'my-class', // UI만
                  },
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
                    maxSize: 1024 * 1024 * 10,
                    accept: 'image/*',
                    limit: 1,
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
                      <Button
                        type='button'
                        variant='default'
                        className='we:w-fit'
                        disabled={editorEmpty}
                        onClick={() => alert('제출 (예시)')}
                      >
                        제출
                      </Button>
                      <Button
                        type='button'
                        variant='secondary'
                        className='we:w-fit we:bg-brand-weak we:text-brand-default'
                        onClick={handleInsertText}
                      >
                        텍스트 삽입
                      </Button>
                      <Button type='button' variant='secondary' className='we:w-fit' onClick={handleInsertFailedImage}>
                        실패 이미지 삽입
                      </Button>
                      <Button type='button' variant='secondary' className='we:w-fit' onClick={handleClear}>
                        초기화
                      </Button>
                    </div>
                  </div>
                }
              />
            </WhiteEditorThemeProvider>
          </section>

          <section className='we:space-y-3 we:h-fit'>
            <div className='we:mb-8 we:flex we:items-center we:justify-center we:gap-3'>
              <h2 className='we:text-3xl we:font-bold'>Viewer</h2>
              <Button
                type='button'
                variant='secondary'
                className='we:w-fit we:bg-brand-weak we:text-brand-default'
                onClick={handleTransformToViewer}
              >
                변환
              </Button>
            </div>
            <div className='we:h-[1000px] we:p-4 we:bg-elevation-background we:overflow-y-auto we:border we:border-border-default we:rounded-md'>
              <WhiteViewer key={viewerKey} className='we:h-full' content={content} />
            </div>
          </section>
        </div>
      </main>
    </TooltipProvider>
  );
}
