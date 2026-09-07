import { useMemo, useRef, useState } from 'react';
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
  TooltipProvider,
} from './shared';
import { cn, i18n, markdownToHtml } from './shared/utils';
import {
  WHITE_EDITOR_TOOLBAR_ITEMS,
  WhiteEditor,
  WhiteEditorThemeStyle,
  WhiteViewer,
  type DragHandleGutterMode,
  type WhiteEditorRef,
} from './white-editor';

type Locale = 'ko' | 'en' | 'es';

const GUTTER_OPTIONS: { value: string; label: string; gutter: DragHandleGutterMode; show: boolean }[] = [
  { value: 'reserve', label: 'reserve (자리 확보)', gutter: 'reserve', show: true },
  { value: 'overlay', label: 'overlay (오버레이)', gutter: 'overlay', show: true },
  { value: 'false', label: 'false (자리 없음)', gutter: false, show: true },
  { value: 'off', label: '핸들 숨김', gutter: 'reserve', show: false },
];

export default function App() {
  const [content, setContent] = useState<JSONContent>(createEmptyContent());
  const [viewerKey, setViewerKey] = useState(0);
  const [locale, setLocale] = useState<Locale>('ko');
  const [editorEmpty, setEditorEmpty] = useState(true);
  const [dragHandleMode, setDragHandleMode] = useState('reserve');
  const editorRef = useRef<WhiteEditorRef>(null);

  const dragHandleConfig = GUTTER_OPTIONS.find((o) => o.value === dragHandleMode) ?? GUTTER_OPTIONS[0];

  // CJK 강조(**) 파싱 테스트용 — 문제의 문장을 미리 채워둠
  const [markdown, setMarkdown] = useState(
    '실제 웹 서비스에서 서버는 단독으로 동작하지 않습니다. 사용자 정보, 게시글, 상품 목록 등 다양한 데이터를 저장하고 조회하기 위해 **데이터베이스(Database)**와 함께 동작합니다.'
  );
  const markdownHtml = useMemo(() => markdownToHtml(markdown), [markdown]);

  const handleLoadMarkdownToEditor = () => {
    editorRef.current?.editor?.commands.setContent(markdownToHtml(markdown));
  };

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

  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
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
            {/* <ThemeToggle /> */}
          </div>
        </div>

        <div className='we:flex we:gap-8 we:flex-col we:w-full'>
          <section className='we:space-y-3 we:w-full'>
            <div className='we:mb-4 we:flex we:items-center we:justify-center we:gap-3'>
              <h2 className='we:text-3xl we:font-bold'>Markdown 입력 테스트</h2>
              <Button type='button' variant='secondary' className='we:w-fit' onClick={handleLoadMarkdownToEditor}>
                에디터에 불러오기
              </Button>
            </div>
            <div className='we:grid we:grid-cols-2 we:gap-4'>
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                spellCheck={false}
                placeholder='마크다운을 입력하세요'
                className='we:h-64 we:w-full we:resize-none we:rounded-md we:border we:border-border-default we:p-3 we:font-mono we:text-sm'
              />
              {/* 개발용 미리보기: markdownToHtml() 출력을 그대로 렌더. App.tsx는 dev 하네스라 dist에 포함되지 않음. */}
              <div
                className='markdown we:prose we:dark:prose-invert we:max-w-full we:h-64 we:overflow-y-auto we:rounded-md we:border we:border-border-default we:p-3'
                dangerouslySetInnerHTML={{ __html: markdownHtml }}
              />
            </div>
          </section>

          <section className='we:space-y-3 we:w-full'>
            <div className='we:mb-8 we:flex we:flex-wrap we:items-center we:justify-center we:gap-3'>
              <h2 className='we:text-3xl we:font-bold'>Editor</h2>
              <Button type='button' variant='secondary' className='we:w-fit' onClick={toggleMode}>
                {mode === 'light' ? 'Dark Mode' : 'Light Mode'}
              </Button>
              <Button type='button' variant='secondary' className='we:w-fit' onClick={handleTransformToViewer}>
                변환
              </Button>
              <Select value={dragHandleMode} onValueChange={setDragHandleMode}>
                <SelectTrigger className='we:w-[220px]'>
                  <SelectValue placeholder='Drag gutter' />
                </SelectTrigger>
                <SelectContent>
                  {GUTTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <WhiteEditorThemeStyle theme={{ mode: mode, colors: {}, zIndex: {} }} />
            <WhiteEditor
              placeholder='내용을 입력해주세요.'
              key={locale}
              locale={locale}
              ref={editorRef}
              disabled={false}
              onEmptyChange={setEditorEmpty}
              showDragHandle={dragHandleConfig.show}
              dragHandleGutter={dragHandleConfig.gutter}
              editorClassName='we:h-[1000px] we:rounded-md we:border we:border-border-default'
              contentClassName='we:h-full we:py-2'
              toolbarItems={WHITE_EDITOR_TOOLBAR_ITEMS}
              showSelectionToolbar={true}
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
                codeBlock: {
                  onCopy: (code) => {
                    console.log(code);
                  },
                },
                // pageMention: {
                //   data: pageLinksData,
                //   id: 'id',
                //   title: 'title',
                //   href: 'href',
                //   path: 'path',
                // },
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
          </section>

          <section className='we:space-y-3 we:w-full'>
            <div className='we:mb-4 we:flex we:items-center we:justify-center we:gap-3'>
              <h2 className='we:text-2xl we:font-bold'>Editor B (멀티 에디터 테스트)</h2>
            </div>
            <WhiteEditor
              placeholder='두 번째 에디터입니다. + 메뉴가 하나만 열려야 합니다.'
              locale={locale}
              disabled={false}
              editorClassName='we:h-[320px] we:rounded-md we:border we:border-border-default'
              contentClassName='we:h-full we:py-2 we:pr-2'
              toolbarItems={WHITE_EDITOR_TOOLBAR_ITEMS}
              showSelectionToolbar={true}
              extension={{
                character: { show: true },
                imageUpload: {
                  upload: handleImageUpload,
                  maxSize: 1024 * 1024 * 10,
                  accept: 'image/*',
                  limit: 1,
                },
              }}
            />
          </section>

          <section className='we:space-y-3 we:w-full'>
            <div className='we:mb-4 we:flex we:items-center we:justify-center we:gap-3'>
              <h2 className='we:text-2xl we:font-bold'>Editor C (멀티 에디터 테스트)</h2>
            </div>
            <WhiteEditor
              placeholder='세 번째 에디터입니다.'
              locale={locale}
              disabled={false}
              editorClassName='we:h-[320px] we:rounded-md we:border we:border-border-default'
              contentClassName='we:h-full we:py-2 we:pr-2'
              toolbarItems={WHITE_EDITOR_TOOLBAR_ITEMS}
              showSelectionToolbar={true}
              extension={{
                character: { show: true },
                imageUpload: {
                  upload: handleImageUpload,
                  maxSize: 1024 * 1024 * 10,
                  accept: 'image/*',
                  limit: 1,
                },
              }}
            />
          </section>

          <section className='we:space-y-3 we:h-fit we:w-full'>
            <div className='we:mb-8 we:flex we:items-center we:justify-center we:gap-3'>
              <h2 className='we:text-3xl we:font-bold'>Viewer</h2>
            </div>
            <div className='we:h-[1000px] we:p-4 we:bg-elevation-background we:overflow-y-auto we:border we:border-border-default we:rounded-md'>
              <WhiteViewer
                key={viewerKey}
                className='we:h-full'
                content={content}
                extension={{
                  codeBlock: {
                    onCopy: (code) => {
                      console.log(code);
                    },
                  },
                }}
              />
            </div>
          </section>
        </div>
      </main>
    </TooltipProvider>
  );
}
