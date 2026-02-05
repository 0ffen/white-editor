# Utilities API

White Editor가 제공하는 유틸리티 함수들의 API를 설명합니다.  
**유틸 함수는 `@0ffen/white-editor/util`에서 import합니다.**

## createEmptyContent

빈 JSONContent 객체를 생성합니다.

### 시그니처

```tsx
function createEmptyContent(): JSONContent;
```

### 반환값

```tsx
{
  type: 'doc',
  content: [],
}
```

### 사용 예제

```tsx
import { createEmptyContent } from '@0ffen/white-editor/util';

const emptyContent = createEmptyContent();
```

#### useState와 함께 사용

```tsx
import { useState } from 'react';
import { WhiteEditor } from '@0ffen/white-editor';
import { createEmptyContent } from '@0ffen/white-editor/util';

function MyEditor() {
  const [content, setContent] = useState(createEmptyContent());

  return <WhiteEditor content={content} onChange={setContent} />;
}
```

#### 초기화 버튼

```tsx
function EditorWithReset() {
  const [content, setContent] = useState(createEmptyContent());

  const handleReset = () => {
    setContent(createEmptyContent());
  };

  return (
    <div>
      <button onClick={handleReset}>초기화</button>
      <WhiteEditor content={content} onChange={setContent} />
    </div>
  );
}
```

## normalizeContentSchema, isValidJSONContent, normalizeEmptyTextBetweenMentions

뷰어에 넘기기 전에 콘텐츠를 검증·정규화할 때 사용합니다. WhiteViewer는 내부에서 `normalizeContentSchema`를 사용하므로, 대부분은 `content`를 그대로 넘기면 됩니다.

### normalizeContentSchema

- **시그니처:** `function normalizeContentSchema(content: unknown): JSONContent`
- **역할:** `unknown`(JSONContent, `{ content: JSONContent, html?: string }`, 배열 등)을 받아 유효한 JSONContent로 정규화합니다. 유효하지 않으면 `{ type: 'doc', content: [] }`를 반환합니다. mention 사이 빈 텍스트는 공백으로 치환합니다.

### isValidJSONContent

- **시그니처:** `function isValidJSONContent(data: unknown): data is JSONContent`
- **역할:** 값이 최소한 `type`(string)을 가진 객체이고, `content`가 있으면 배열인지 검사합니다.

### normalizeEmptyTextBetweenMentions

- **시그니처:** `function normalizeEmptyTextBetweenMentions(content: JSONContent): JSONContent`
- **역할:** mention 노드 사이에 있는 빈 text 노드를 공백(`' '`)으로 치환합니다. 연속 mention이 붙어 보이는 현상을 방지할 때 사용합니다.

### 사용 예제

```tsx
import {
  WhiteViewer,
  normalizeContentSchema,
  isValidJSONContent,
  normalizeEmptyTextBetweenMentions,
} from '@0ffen/white-editor/util';

// API 응답이 { content: JSONContent, html: string } 형태일 때
const apiResponse = await fetch('/api/doc/1').then((r) => r.json());
const normalized = normalizeContentSchema(apiResponse);
<WhiteViewer content={apiResponse} />; // 내부에서 정규화되므로 그대로 넘겨도 됨

// 저장 전 검증
if (isValidJSONContent(userInput)) {
  await save(userInput);
}
```

## getHtmlContent

JSONContent를 HTML 문자열로 변환합니다.

### 시그니처

```tsx
function getHtmlContent(content: JSONContent): string;
```

### 파라미터

- **content** (`JSONContent`) - 변환할 JSON 콘텐츠

### 반환값

HTML 문자열

### 사용 예제

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

#### 출력

```html
<h1>제목</h1>
<p>본문</p>
```

### 활용 예제

#### 서버에 저장

```tsx
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
```

#### 이메일 발송

```tsx
const sendEmail = async (content: JSONContent) => {
  const html = getHtmlContent(content);

  await emailService.send({
    to: 'user@example.com',
    subject: '알림',
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        ${html}
      </div>
    `,
  });
};
```

#### HTML 파일로 다운로드

```tsx
const downloadAsHTML = (content: JSONContent, filename: string) => {
  const html = getHtmlContent(content);
  const fullHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${filename}</title>
        <style>
          body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `;

  const blob = new Blob([fullHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.html`;
  a.click();
  URL.revokeObjectURL(url);
};
```

#### PDF 생성 준비

```tsx
import html2pdf from 'html2pdf.js';

const exportToPDF = async (content: JSONContent, filename: string) => {
  const html = getHtmlContent(content);
  const element = document.createElement('div');
  element.innerHTML = html;

  await html2pdf()
    .set({
      margin: 1,
      filename: `${filename}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { format: 'a4', orientation: 'portrait' },
    })
    .from(element)
    .save();
};
```

## setCSSVariables

CSS 커스텀 프로퍼티를 동적으로 설정합니다.

### 시그니처

```tsx
function setCSSVariables(variables: Record<string, string>): void;
```

### 파라미터

- **variables** (`Record<string, string>`) - CSS 변수명과 값의 객체

### 사용 예제

```tsx
import { useEffect } from 'react';
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

#### 색상

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
- `--muted` - 음소거된 색상
- `--muted-foreground` - 음소거된 색상의 전경색
- `--border` - 테두리 색상
- `--input` - 입력 필드 테두리 색상
- `--ring` - 포커스 링 색상

#### 레이아웃

- `--radius` - 테두리 반경 (예: `0.5rem`)

### 활용 예제

#### 다크 테마

```tsx
useEffect(() => {
  setCSSVariables({
    '--background': '#0f172a',
    '--foreground': '#f1f5f9',
    '--primary': '#3b82f6',
    '--primary-foreground': '#ffffff',
    '--secondary': '#1e293b',
    '--secondary-foreground': '#f1f5f9',
    '--muted': '#1e293b',
    '--muted-foreground': '#94a3b8',
    '--accent': '#1e293b',
    '--accent-foreground': '#f1f5f9',
    '--border': '#334155',
    '--input': '#1e293b',
    '--ring': '#3b82f6',
  });
}, []);
```

#### 라이트 테마

```tsx
useEffect(() => {
  setCSSVariables({
    '--background': '#ffffff',
    '--foreground': '#0f172a',
    '--primary': '#0f172a',
    '--primary-foreground': '#f8fafc',
    '--secondary': '#f1f5f9',
    '--secondary-foreground': '#0f172a',
    '--muted': '#f1f5f9',
    '--muted-foreground': '#64748b',
    '--accent': '#f1f5f9',
    '--accent-foreground': '#0f172a',
    '--border': '#e2e8f0',
    '--input': '#e2e8f0',
    '--ring': '#0f172a',
  });
}, []);
```

#### 동적 테마 전환

```tsx
import { useState, useEffect } from 'react';
import { WhiteEditor } from '@0ffen/white-editor';
import { setCSSVariables } from '@0ffen/white-editor/util';

const themes = {
  light: {
    '--background': '#ffffff',
    '--foreground': '#0f172a',
    '--primary': '#3b82f6',
    '--border': '#e2e8f0',
  },
  dark: {
    '--background': '#0f172a',
    '--foreground': '#f1f5f9',
    '--primary': '#60a5fa',
    '--border': '#334155',
  },
  pink: {
    '--background': '#fdf2f8',
    '--foreground': '#831843',
    '--primary': '#ec4899',
    '--border': '#f9a8d4',
  },
};

function ThemedEditor() {
  const [theme, setTheme] = useState<keyof typeof themes>('light');

  useEffect(() => {
    setCSSVariables(themes[theme]);
  }, [theme]);

  return (
    <div>
      <div className='mb-4 flex gap-2'>
        <button onClick={() => setTheme('light')}>Light</button>
        <button onClick={() => setTheme('dark')}>Dark</button>
        <button onClick={() => setTheme('pink')}>Pink</button>
      </div>
      <WhiteEditor />
    </div>
  );
}
```

#### 브랜드 컬러 적용

```tsx
useEffect(() => {
  const brandColors = {
    '--primary': '#ff6b6b',
    '--primary-foreground': '#ffffff',
    '--secondary': '#4ecdc4',
    '--secondary-foreground': '#ffffff',
    '--accent': '#ffe66d',
    '--accent-foreground': '#000000',
    '--border': '#dfe6e9',
  };

  setCSSVariables(brandColors);
}, []);
```

## 전체 예제

### 완전한 에디터 시스템

```tsx
import { useState, useEffect } from 'react';
import { WhiteEditor, WhiteViewer } from '@0ffen/white-editor';
import { createEmptyContent, getHtmlContent, setCSSVariables } from '@0ffen/white-editor/util';
import type { JSONContent } from '@0ffen/white-editor';

function CompleteSystem() {
  const [content, setContent] = useState<JSONContent>(createEmptyContent());
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const themes = {
      light: {
        '--background': '#ffffff',
        '--foreground': '#0f172a',
        '--primary': '#3b82f6',
        '--border': '#e2e8f0',
      },
      dark: {
        '--background': '#0f172a',
        '--foreground': '#f1f5f9',
        '--primary': '#60a5fa',
        '--border': '#334155',
      },
    };

    setCSSVariables(themes[theme]);
  }, [theme]);

  const handleReset = () => {
    if (confirm('모든 내용을 지우시겠습니까?')) {
      setContent(createEmptyContent());
    }
  };

  const handleSave = async () => {
    const html = getHtmlContent(content);

    try {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, html }),
      });
      alert('저장되었습니다.');
    } catch (error) {
      alert('저장 실패');
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
    URL.revokeObjectURL(url);
  };

  return (
    <div className='p-6'>
      <div className='mb-4 flex gap-2'>
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? '🌙' : '☀️'} 테마 전환
        </button>
        <button onClick={handleReset}>초기화</button>
        <button onClick={handleSave}>저장</button>
        <button onClick={handleExport}>HTML 내보내기</button>
      </div>

      <WhiteEditor content={content} onChange={setContent} contentClassName='min-h-[500px]' />
    </div>
  );
}
```

## 참고

- [기본 사용법](/guide/usage) - 유틸리티 사용 가이드
- [에디터 제어](/guide/editor-control) - 에디터 제어 방법
- [Types](/api/types) - 타입 정의
