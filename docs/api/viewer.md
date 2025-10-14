# Viewer

WhiteViewer 컴포넌트의 API를 설명합니다.

## WhiteViewer

저장된 콘텐츠를 읽기 전용으로 렌더링하는 컴포넌트입니다.

## Props

### content

- **타입:** `JSONContent`
- **필수:** ✅

렌더링할 JSON 콘텐츠입니다.

```tsx
import { WhiteViewer } from '@0ffen/white-editor';
import type { JSONContent } from '@0ffen/white-editor';

const content: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: '제목' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: '본문 내용입니다.' }],
    },
  ],
};

<WhiteViewer content={content} />;
```

### className

- **타입:** `string`
- **기본값:** `undefined`

Viewer 컨테이너의 CSS 클래스를 설정합니다.

```tsx
<WhiteViewer content={content} className='prose max-w-none rounded-lg border p-6' />
```

## 기본 예제

### 간단한 사용

```tsx
import { WhiteViewer } from '@0ffen/white-editor';

const sampleContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: '안녕하세요!' }],
    },
  ],
};

function MyViewer() {
  return <WhiteViewer content={sampleContent} />;
}
```

### 스타일링

```tsx
<WhiteViewer content={content} className='prose prose-lg max-w-none rounded-lg border bg-white p-8 shadow-lg' />
```

## 실시간 미리보기

에디터와 함께 사용하여 실시간 미리보기를 구현할 수 있습니다.

```tsx
import { useState } from 'react';
import { WhiteEditor, WhiteViewer, createEmptyContent } from '@0ffen/white-editor';
import type { JSONContent } from '@0ffen/white-editor';

function EditorWithPreview() {
  const [content, setContent] = useState<JSONContent>(createEmptyContent());

  return (
    <div className='grid grid-cols-2 gap-4'>
      <div>
        <h2>Editor</h2>
        <WhiteEditor contentClassName='h-[600px]' onChange={setContent} />
      </div>

      <div>
        <h2>Preview</h2>
        <WhiteViewer content={content} className='h-[600px] overflow-auto rounded-lg border p-4' />
      </div>
    </div>
  );
}
```

## 탭 전환 뷰

편집과 미리보기를 탭으로 전환합니다.

```tsx
import { useState } from 'react';
import { WhiteEditor, WhiteViewer, createEmptyContent } from '@0ffen/white-editor';

function TabView() {
  const [content, setContent] = useState(createEmptyContent());
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  return (
    <div>
      <div className='mb-4 flex gap-2'>
        <button onClick={() => setMode('edit')} className={mode === 'edit' ? 'font-bold' : ''}>
          편집
        </button>
        <button onClick={() => setMode('preview')} className={mode === 'preview' ? 'font-bold' : ''}>
          미리보기
        </button>
      </div>

      {mode === 'edit' ? (
        <WhiteEditor content={content} onChange={setContent} contentClassName='min-h-[500px]' />
      ) : (
        <WhiteViewer content={content} className='min-h-[500px] rounded-lg border p-4' />
      )}
    </div>
  );
}
```

## 서버 데이터 렌더링

서버에서 가져온 콘텐츠를 표시합니다.

```tsx
import { useState, useEffect } from 'react';
import { WhiteViewer } from '@0ffen/white-editor';
import type { JSONContent } from '@0ffen/white-editor';

function DocumentViewer({ documentId }: { documentId: string }) {
  const [content, setContent] = useState<JSONContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/documents/${documentId}`)
      .then((res) => res.json())
      .then((data) => {
        setContent(data.content);
        setLoading(false);
      });
  }, [documentId]);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!content) {
    return <div>문서를 찾을 수 없습니다.</div>;
  }

  return <WhiteViewer content={content} className='prose max-w-none p-6' />;
}
```

## 블로그 포스트 렌더링

```tsx
interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  content: JSONContent;
}

function BlogPostView({ post }: { post: BlogPost }) {
  return (
    <article className='mx-auto max-w-4xl p-6'>
      <header className='mb-8'>
        <h1 className='mb-2 text-4xl font-bold'>{post.title}</h1>
        <div className='text-gray-600'>
          <span>{post.author}</span>
          <span className='mx-2'>·</span>
          <time>{post.date}</time>
        </div>
      </header>

      <WhiteViewer content={post.content} className='prose prose-lg max-w-none' />
    </article>
  );
}
```

## 다중 문서 뷰

여러 문서를 순차적으로 표시합니다.

```tsx
function MultiDocumentView({ documents }: { documents: Document[] }) {
  return (
    <div className='space-y-8'>
      {documents.map((doc) => (
        <section key={doc.id} className='border-b pb-8'>
          <h2 className='mb-4 text-2xl font-bold'>{doc.title}</h2>
          <WhiteViewer content={doc.content} className='prose max-w-none' />
        </section>
      ))}
    </div>
  );
}
```

## 프린트 뷰

인쇄에 최적화된 뷰를 만듭니다.

```tsx
function PrintableDocument({ content }: { content: JSONContent }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <button onClick={handlePrint} className='no-print mb-4'>
        인쇄
      </button>

      <WhiteViewer content={content} className='prose max-w-none print:p-0' />

      <style>{`
        @media print {
          .no-print {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
```

## Prose 스타일링

Tailwind CSS의 Typography 플러그인을 사용한 스타일링 예제입니다.

```tsx
<WhiteViewer
  content={content}
  className='prose prose-slate prose-lg prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-a:text-blue-600 prose-code:text-pink-600 prose-pre:bg-gray-900 max-w-none'
/>
```

## 참고

- [Editor Props](/api/editor-props) - Editor 컴포넌트 Props
- [Types](/api/types) - 타입 정의
- [기본 사용법](/guide/usage) - Viewer 사용 가이드
