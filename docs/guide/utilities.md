# 유틸리티

White Editor가 제공하는 유틸리티 함수들은 **`@0ffen/white-editor/util`**에서 import합니다.

## createEmptyContent

빈 JSONContent 객체를 생성하는 유틸리티 함수입니다.

### 사용법

```tsx
import { createEmptyContent } from '@0ffen/white-editor/util';

const emptyContent = createEmptyContent();
```

### 반환값

```tsx
{
  type: 'doc',
  content: [],
}
```

### 활용 예제

```tsx
import { useState } from 'react';
import { WhiteEditor } from '@0ffen/white-editor';
import { createEmptyContent } from '@0ffen/white-editor/util';

function MyEditor() {
  const [content, setContent] = useState(createEmptyContent());

  return <WhiteEditor content={content} onChange={setContent} />;
}
```

## getHtmlContent

JSONContent를 HTML 문자열로 변환하는 유틸리티 함수입니다.

### 사용법

```tsx
import { getHtmlContent } from '@0ffen/white-editor/util';
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
      content: [{ type: 'text', text: '본문' }],
    },
  ],
};

const html = getHtmlContent(content);
console.log(html);
```

### 반환값

```html
<h1>제목</h1>
<p>본문</p>
```

### 활용 예제

#### 서버에 HTML과 JSON 모두 저장

```tsx
import { WhiteEditor } from '@0ffen/white-editor';
import { getHtmlContent } from '@0ffen/white-editor/util';
import type { JSONContent } from '@0ffen/white-editor';

function MyEditor() {
  const handleSave = async (content: JSONContent) => {
    const html = getHtmlContent(content);

    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: content,
        html: html,
      }),
    });
  };

  return (
    <WhiteEditor
      onChange={(content) => {
        console.log('JSON:', content);
        console.log('HTML:', getHtmlContent(content));
      }}
    />
  );
}
```

#### 이메일 발송

```tsx
const sendEmail = async (content: JSONContent) => {
  const html = getHtmlContent(content);

  await fetch('/api/send-email', {
    method: 'POST',
    body: JSON.stringify({
      to: 'user@example.com',
      subject: '알림',
      html: html,
    }),
  });
};
```

## setCSSVariables

에디터의 CSS 변수를 동적으로 설정하는 유틸리티 함수입니다.

### 사용법

```tsx
import { useEffect } from 'react';
import { WhiteEditor } from '@0ffen/white-editor';
import { setCSSVariables } from '@0ffen/white-editor/util';

function MyEditor() {
  useEffect(() => {
    setCSSVariables({
      '--primary': '#3b82f6',
      '--secondary': '#64748b',
      '--background': '#ffffff',
      '--foreground': '#0f172a',
      '--border': '#e2e8f0',
    });
  }, []);

  return <WhiteEditor />;
}
```

### 사용 가능한 CSS 변수

에디터는 [Shadcn UI](https://ui.shadcn.com/themes)의 CSS 변수 시스템을 따릅니다.

#### 색상 변수

- `--background` - 배경색
- `--foreground` - 전경색 (텍스트)
- `--primary` - 주요 색상
- `--primary-foreground` - 주요 색상의 전경색
- `--secondary` - 보조 색상
- `--secondary-foreground` - 보조 색상의 전경색
- `--accent` - 강조 색상
- `--accent-foreground` - 강조 색상의 전경색
- `--destructive` - 경고/삭제 색상
- `--destructive-foreground` - 경고/삭제 색상의 전경색
- `--border` - 테두리 색상
- `--input` - 입력 필드 테두리 색상
- `--ring` - 포커스 링 색상
- `--muted` - 음소거된 색상
- `--muted-foreground` - 음소거된 색상의 전경색

#### 레이아웃 변수

- `--radius` - 테두리 반경

### 테마 적용 예제

#### 다크 테마

```tsx
useEffect(() => {
  setCSSVariables({
    '--background': '#0f172a',
    '--foreground': '#f1f5f9',
    '--primary': '#3b82f6',
    '--secondary': '#1e293b',
    '--border': '#334155',
    '--input': '#1e293b',
    '--ring': '#3b82f6',
  });
}, []);
```

#### 브랜드 색상 적용

```tsx
useEffect(() => {
  setCSSVariables({
    '--primary': '#ff6b6b',
    '--primary-foreground': '#ffffff',
    '--secondary': '#4ecdc4',
    '--border': '#ffe66d',
  });
}, []);
```

#### 동적 테마 전환

```tsx
function ThemedEditor() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      setCSSVariables({
        '--background': '#0f172a',
        '--foreground': '#f1f5f9',
        '--border': '#334155',
      });
    } else {
      setCSSVariables({
        '--background': '#ffffff',
        '--foreground': '#0f172a',
        '--border': '#e2e8f0',
      });
    }
  }, [isDark]);

  return (
    <div>
      <button onClick={() => setIsDark(!isDark)}>테마 전환</button>
      <WhiteEditor />
    </div>
  );
}
```

## 실전 예제

### 완전한 에디터 시스템

```tsx
import { useState, useEffect } from 'react';
import { WhiteEditor, WhiteViewer } from '@0ffen/white-editor';
import { createEmptyContent, getHtmlContent, setCSSVariables } from '@0ffen/white-editor/util';
import type { JSONContent, Editor } from '@0ffen/white-editor';

function CompleteEditor() {
  const [content, setContent] = useState<JSONContent>(createEmptyContent());
  const [editor, setEditor] = useState<Editor | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setCSSVariables({
      '--primary': '#3b82f6',
      '--border': '#e2e8f0',
    });
  }, []);

  const handleSave = async () => {
    const html = getHtmlContent(content);

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content,
          html: html,
        }),
      });

      if (response.ok) {
        alert('저장되었습니다.');
      }
    } catch (error) {
      console.error('저장 실패:', error);
    }
  };

  const handleExport = () => {
    const html = getHtmlContent(content);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
  };

  return (
    <div className='p-4'>
      <div className='mb-4 flex gap-2'>
        <button onClick={handleSave}>저장</button>
        <button onClick={handleExport}>HTML 내보내기</button>
        <button onClick={() => setShowPreview(!showPreview)}>{showPreview ? '편집' : '미리보기'}</button>
      </div>

      {showPreview ? (
        <WhiteViewer content={content} className='rounded-lg border p-4' />
      ) : (
        <WhiteEditor content={content} onChange={setContent} onCreate={setEditor} contentClassName='min-h-[500px]' />
      )}
    </div>
  );
}
```

## 다음 단계

- [API 레퍼런스](/api/editor-props) - 모든 Props를 확인합니다.
- [Types API](/api/types) - 타입 정의를 확인합니다.
- [Utilities API](/api/utilities) - 유틸리티 함수 API를 확인합니다.
