# White Editor

## 작업 목적

- Enki 서비스에서 공통으로 사용하는 에디터 기능을 모듈화
- 기능 확장과 유지보수 효율성 향상

## Features

- Heading, Paragraph
- Bold, Italic, Underline, Strike through
- Horizontal Rule
- Text Color,
- Inline Code,
- Image
- Image Editor (shape, Drawline, Crop, Text)
- List (Bullet List, Ordered List, task List)
- Link
- Table
- Blockquote
- Text Align
- Mention
- Mathematics (inline, block)
- Undo, Redo

## Stack

Core

- **TipTap** - Rich text editor framework
- **TUI Image Editor** - Image editing library
- **React**
- **TypeScript**
- **Vite**
- **TailwindCSS, Shadcn UI** - Styling
- **Lucide React** - Icon

## 설치 방법

```bash
npm config set @0ffen:registry=https://npm.pkg.github.com
pnpm install @0ffen/white-editor
```

## 사용 방법

### 1. White Editor

### Next

```tsx
'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';
import type { WhiteEditorRef } from '@0ffen/white-editor';

// SSR 비활성화로 동적 임포트
const WhiteEditor = dynamic(() => import('@0ffen/white-editor').then((mod) => ({ default: mod.WhiteEditor })), {
  ssr: false,
});

export default function Home() {
  const editorRef = useRef<WhiteEditorRef>(null);

  return <WhiteEditor ref={editorRef} />;
}
```

### React

```tsx
import { useRef } from 'react';
import { WhiteEditor, type WhiteEditorRef } from '@0ffen/white-editor';

function MyComponent() {
  const editorRef = useRef<WhiteEditorRef | null>(null);

  return (
    <WhiteEditor
      ref={editorRef}
      theme={'light'}
      disabled={false}
      editorClassName={'white-editor-class'}
      contentClassName={'content-class'}
      placeholder='여기에 텍스트를 입력하세요...'
      showToolbar={true}
      toolbarItems={[
        ['undo', 'redo'],
        ['heading', 'bold', 'italic', 'color'],
      ]}
      toolbarProps={{
        heading: {
          options: [
            { label: '헤딩 1', level: 1 },
            { label: '헤딩 2', level: 2 },
          ],
        },
        image: {
          maxSize: 1024 * 1024 * 10,
          accept: 'image/*',
        },
      }}
      onChange={() => {
        if (editorRef.current) {
          console.log('onChange', editorRef.current.getJSON());
        }
      }}
    />
  );
}
```

#### 커스텀 테마 설정

테마를 객체로 설정하여 색상을 커스터마이징할 수 있습니다.

```tsx
import { useRef } from 'react';
import { WhiteEditor, type WhiteEditorRef } from '@0ffen/white-editor';

function MyComponent() {
  const editorRef = useRef<WhiteEditorRef | null>(null);

  return (
    <WhiteEditor
      ref={editorRef}
      theme={{
        mode: 'dark',
        colors: {
          background: 'var(--color-elevation-background)',
          foreground: 'var(--color-text-normal)',
          popover: 'var(--color-elevation-dropdown)',
          popoverForeground: 'var(--color-text-normal)',
          card: 'var(--color-elevation-level1)',
          cardForeground: 'var(--color-text-normal)',
          primary: 'var(--color-brand-default)',
          primaryForeground: 'var(--color-white)',
          secondary: 'var(--color-elevation-level2)',
          secondaryForeground: 'var(--color-text-sub)',
          muted: 'var(--color-elevation-level2)',
          mutedForeground: 'var(--color-text-normal)',
          accent: 'var(--color-brand-weak)',
          accentForeground: 'var(--color-text-normal)',
        },
      }}
      placeholder='내용을 입력해주세요.'
      showToolbar={true}
    />
  );
}
```

#### 툴바 숨기기

`showToolbar={false}`로 설정하면 툴바를 숨길 수 있습니다.

```tsx
<WhiteEditor
  showToolbar={false}
  placeholder='툴바 없이 간단한 입력만 가능합니다.'
/>
```

### 1-1. Editor Types

#### WhiteEditorProps

메인 에디터 컴포넌트의 모든 props를 포함

```ts
interface WhiteEditorProps<T> extends WhiteEditorUIProps, WhiteEditorExtensions<T>, TipTapEditorOptions {
  // 콜백 함수들 - 에디터 상태 변화 감지
  onChange?: (jsonContent: JSONContent) => void; // 콘텐츠 변경시
  onUpdate?: (jsonContent: JSONContent) => void; // 실시간 업데이트
  onFocus?: (jsonContent: JSONContent) => void; // 포커스시
  onBlur?: (jsonContent: JSONContent) => void; // 포커스 해제시
  onCreate?: (editor: Editor) => void; // 에디터 생성시
  onDestroy?: () => void; // 에디터 파괴시
  onSelectionUpdate?: (editor: Editor) => void; // 선택 영역 업데이트시
  editorProps?: EditorProps; // TipTap 에디터 추가 설정
}
```

#### WhiteEditorUIProps

에디터의 외관과 툴바 설정을 담당

```ts
interface WhiteEditorUIProps {
  theme?: 'light' | 'dark' | WhiteEditorTheme; // 테마 설정
  disabled?: boolean; // 에디터 비활성화 여부
  editorClassName?: string; // 에디터 전체 스타일
  contentClassName?: string; // 에디터 내용 영역 스타일
  toolbarItems?: ToolbarItem[][]; // 툴바 버튼 그룹 설정
  toolbarProps?: ToolbarItemProps; // 각 툴바 버튼의 상세 옵션
  footer?: React.ReactNode; // 에디터 하단 커스텀 영역
  placeholder?: string; // 에디터가 비어있을 때 표시할 텍스트
  showToolbar?: boolean; // 툴바 표시 여부 (기본값: true)
}

interface WhiteEditorTheme {
  mode?: 'light' | 'dark';
  colors?: {
    background?: string;
    foreground?: string;
    card?: string;
    cardForeground?: string;
    popover?: string;
    popoverForeground?: string;
    primary?: string;
    primaryForeground?: string;
    secondary?: string;
    secondaryForeground?: string;
    muted?: string;
    mutedForeground?: string;
    accent?: string;
    accentForeground?: string;
    codeBlockBackground?: string; // 코드 블록 배경색
  };
}
```

#### WhiteEditorExtensions

에디터 확장 기능 설정

```ts
interface WhiteEditorExtensions<T> {
  extension?: {
    mention?: MentionConfig<T>; // @멘션 기능을 위한 멘션 옵션 설정
    pageMention?: {
      // 페이지 링크 멘션 설정
      data: P[];
      id: keyof P;
      title: keyof P;
      href: keyof P;
      path?: keyof P; // 경로 정보 (optional)
      icon?: keyof P; // 아이콘 (optional)
      renderLabel?: (item: P) => React.ReactNode; // 커스텀 제목 렌더링 (optional)
    };
    character?: {
      //글자수 카운트를 위한 옵션 설정
      show?: boolean;
      limit?: number; //limit을 작성하지 않으면 count만 노출
      className?: string;
    };
    imageUpload?: {
      // 이미지 업로드 설정
      upload?: (file: File) => Promise<string>;
      onError?: (error: Error) => void;
      onSuccess?: (url: string) => void;
    };
  };
}
```

#### WhiteEditorRef

Ref를 통해 에디터에 접근할 때 사용하는 타입

```ts
interface WhiteEditorRef {
  editor: Editor | null; // TipTap 에디터 인스턴스
  charactersCount: number; // 현재 글자 수
  getHTML: () => string; // HTML 문자열 반환
  getJSON: () => JSONContent; // JSON 콘텐츠 반환
  getText: () => string; // 순수 텍스트 반환
  setContent: (content: string | JSONContent) => void; // 콘텐츠 설정 - 수정기능이 필요할때 사용
  focus: () => void; // 포커스
  blur: () => void; // 블러
  isEmpty: boolean; // 빈 상태 확인
  clear: () => void; // 콘텐츠 비우기
}
```

### 1-2. Toolbar

#### Custom Toolbar Items

이중 배열로 툴바 버튼을 그룹화합니다.

```tsx
toolbarItems={[
  ['undo', 'redo'],
  ['heading', 'bold', 'italic', 'color'],
]}
```

#### Toolbar Props

주요 toolbar props들의 커스터마이징 옵션들입니다.

#### Bold/Italic/Strike 등 텍스트 서식

```ts

toolbarProps: {
  bold: {
    icon: <BoldIcon />,              // 커스텀 아이콘
    className: 'my-bold-button',     // 추가 CSS 클래스
  },
}
```

#### Heading 드롭다운 (Type : HeadingDropdownMenuProps)

```ts
//default Heading Option
const defaultHeadingOptions: HeadingOption[] = [
  { label: 'Normal Text', level: null },
  { label: 'Heading 1', level: 1 },
  { label: 'Heading 2', level: 2 },
  { label: 'Heading 3', level: 3 },
];


toolbarProps: {
  heading: {
    options: [                       // Heading 옵션 커스터마이징
      { label: '본문', level: null },
      { label: '제목 1', level: 1 },
      { label: '제목 2', level: 2 },
    ],
    icon: <HeaderIcon />,            // 커스텀 아이콘
    triggerClassName: 'w-20',        // 트리거 버튼 스타일
    contentClassName: 'min-w-32',    // 드롭다운 내용 스타일
  },
}
```

##### 이미지 업로드 (ImageDialogProps)

```tsx
toolbarProps: {
  image: {
    maxSize: 1024 * 1024 * 10,       // 파일 크기 제한 (기본: 5MB)
    accept: 'image/*',               // 허용 파일 타입
    upload: async (file) => imageUrl,
    onSuccess: (url) => console.log(url),
    onError: (error) => console.error(error),
    closeOnError: true,              // 에러 발생 시 모달 자동 닫기 (기본값: true)
  },
}
```

### 1-3. 확장 기능 (Extensions)

#### 멘션 (Mention)

`@` 기호를 입력하면 사용자를 태그할 수 있는 멘션 기능입니다.

```tsx
<WhiteEditor
  extension={{
    mention: {
      data: [
        { uuid: 1, name: 'White Lee', nickname: 'white' },
        { uuid: 2, name: 'Black Kim', nickname: 'black' },
      ],
      id: 'uuid',
      label: 'nickname',
    },
  }}
/>
```

#### 페이지 링크 멘션 (Page Link Mention)

페이지 링크를 멘션으로 추가할 수 있는 기능입니다. 일반 멘션과 함께 사용할 수 있으며, `@` 입력 시 사용자와 페이지 링크가 함께 표시됩니다.

```tsx
interface Page {
  pageId: string;
  title: string;
  url: string;
  path?: string;
  icon?: string;
}

const pages: Page[] = [
  { pageId: '1', title: '프로젝트 개요', url: '/pages/1', path: '/docs/project' },
  { pageId: '2', title: 'API 문서', url: '/pages/2', path: '/docs/api' },
];

<WhiteEditor
  extension={{
    mention: {
      data: users,
      id: 'userId',
      label: 'username',
    },
    pageMention: {
      data: pages,
      id: 'pageId',
      title: 'title',
      href: 'url',
      path: 'path', // optional
      icon: 'icon', // optional
      renderLabel: (item) => (
        <div className="flex items-center gap-2">
          {item.icon && <img src={item.icon} alt="" />}
          <span>{item.title}</span>
        </div>
      ), // optional
    },
  }}
/>
```

#### 이미지 업로드 확장 (Image Upload Extension)

이미지 업로드를 extension으로 설정할 수 있습니다. 이 방법은 toolbarProps의 image 설정과 함께 사용할 수 있습니다.

```tsx
const handleImageUpload = async (file: File): Promise<string> => {
  // 이미지 업로드 로직
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  
  const data = await response.json();
  return data.url;
};

<WhiteEditor
  extension={{
    imageUpload: {
      upload: handleImageUpload,
      onSuccess: (url) => {
        console.log('이미지 업로드 성공:', url);
      },
      onError: (error) => {
        console.error('이미지 업로드 실패:', error);
      },
    },
  }}
  toolbarProps={{
    image: {
      maxSize: 1024 * 1024 * 10,
      accept: 'image/*',
    },
  }}
/>
```

#### 글자수 카운트 (Character Count)

에디터에 입력된 글자수를 표시하고 제한할 수 있습니다.

```tsx
<WhiteEditor
  extension={{
    character: {
      show: true,
      limit: 1000, // optional: limit을 설정하지 않으면 count만 표시
      className: 'text-gray-600', // optional: 스타일 커스터마이징
    },
  }}
/>
```

## 2. White Viewer

읽기 전용 뷰어 컴포넌트

```tsx
import { WhiteViewer, type JSONContent } from '@0ffen/white-editor';

const sampleContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: '제목입니다' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: '본문 내용입니다.' }],
    },
  ],
};

<WhiteViewer content={sampleContent} className='w-full' />;
```

## 3. 에디터 확장 (Node/Extension)

White Editor는 TipTap의 확장 가능한 아키텍처를 활용하여 커스텀 노드와 확장 기능을 추가할 수 있습니다.

### 3-1. 외부 Extension 추가 (addExtensions)

프로젝트에 없는 TipTap extension을 추가할 때 사용합니다.

```tsx
import { Extension } from '@tiptap/core';
import { WhiteEditor } from '@0ffen/white-editor';
import CustomExtension from '@tiptap/extension-custom';

<WhiteEditor
  addExtensions={[
    CustomExtension.configure({
      // extension 설정
    }),
  ]}
/>
```

### 3-2. 커스텀 노드 추가 (customNodes)

`Node.create()`로 만든 커스텀 노드를 추가할 때 사용합니다.

```tsx
import { Node } from '@tiptap/core';
import { WhiteEditor } from '@0ffen/white-editor';

const CustomNode = Node.create({
  name: 'customNode',
  // 노드 설정
});

<WhiteEditor
  customNodes={[CustomNode]}
/>
```

### 3-3. Extension 설정 오버라이드 (overrideExtensions)

기본 extension의 설정을 오버라이드할 때 사용합니다.

```tsx
<WhiteEditor
  overrideExtensions={{
    heading: {
      levels: [1, 2, 3], // heading extension의 levels 설정 변경
    },
    link: {
      openOnClick: false, // link extension의 openOnClick 설정 변경
    },
  }}
/>
```

### 3-4. 커스텀 노드 뷰 (customNodeViews)

노드 타입별로 커스텀 React 컴포넌트를 매핑할 수 있습니다.

```tsx
import { WhiteEditor } from '@0ffen/white-editor';
import CustomCodeBlock from './CustomCodeBlock';

<WhiteEditor
  customNodeViews={{
    codeBlock: CustomCodeBlock, // codeBlock 노드에 커스텀 컴포넌트 사용
  }}
/>
```

커스텀 노드 뷰 컴포넌트 예제:

```tsx
import React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';

const CustomCodeBlock: React.FC<NodeViewProps> = ({ node }) => {
  return (
    <NodeViewWrapper className="custom-code-block">
      <pre>
        <code>{node.textContent}</code>
      </pre>
    </NodeViewWrapper>
  );
};

export default CustomCodeBlock;
```

### 3-5. 복합 확장 예제

여러 확장 기능을 함께 사용하는 예제입니다.

```tsx
import { Extension } from '@tiptap/core';
import { Node } from '@tiptap/core';
import { WhiteEditor } from '@0ffen/white-editor';
import CustomExtension from '@tiptap/extension-custom';

const CustomNode = Node.create({
  name: 'customNode',
  // 노드 설정
});

<WhiteEditor
  addExtensions={[CustomExtension]}
  customNodes={[CustomNode]}
  overrideExtensions={{
    heading: {
      levels: [1, 2],
    },
  }}
  customNodeViews={{
    codeBlock: CustomCodeBlock,
  }}
/>
```

## 4. 에디터 제어

### Ref를 통한 에디터 제어

ref를 사용하여 에디터의 메서드에 직접 접근할 수 있습니다.

```tsx
import { useRef } from 'react';
import { WhiteEditor, type WhiteEditorRef } from '@0ffen/white-editor';

function MyComponent() {
  const editorRef = useRef<WhiteEditorRef>(null);

  const handleSave = () => {
    if (editorRef.current) {
      // JSON 콘텐츠 가져오기
      const jsonData = editorRef.current.getJSON();
      console.log('JSON:', jsonData);

      // HTML 콘텐츠 가져오기
      const htmlData = editorRef.current.getHTML();
      console.log('HTML:', htmlData);

      // 순수 텍스트 가져오기
      const textData = editorRef.current.getText();
      console.log('Text:', textData);

      // 에디터 내용 비우기
      editorRef.current.clear();
    }
  };

  const handleInsertText = () => {
    // TipTap Editor 인스턴스를 통한 직접 제어
    editorRef.current?.editor?.commands.insertContent('Hello World!');
  };

  const handleSetContent = () => {
    // 콘텐츠 설정, 수정시 콘텐츠 불러오기에 유용
    if (editorRef.current) {
      editorRef.current.setContent({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '새로운 내용입니다.' }],
          },
        ],
      });
    }
  };

  return (
    <div>
      <WhiteEditor ref={editorRef} />
      <button onClick={handleSave}>저장</button>
      <button onClick={handleInsertText}>텍스트 삽입</button>
      <button onClick={handleSetContent}>콘텐츠 설정</button>
    </div>
  );
}
```

## 5. Utilities

### getHtmlContent - HTML 변환

JSONContent를 HTML 문자열로 변환합니다.

```tsx
import { useRef } from 'react';
import { WhiteEditor, type WhiteEditorRef, getHtmlContent } from '@0ffen/white-editor';

function MyComponent() {
  const editorRef = useRef<WhiteEditorRef>(null);

  const handleSave = () => {
    if (editorRef.current) {
      const jsonContent = editorRef.current.getJSON();
      const html = getHtmlContent(jsonContent);
      console.log(html); // <h1>제목</h1><p>본문</p>
    }
  };

  return (
    <div>
      <WhiteEditor ref={editorRef} />
      <button onClick={handleSave}>저장</button>
    </div>
  );
}
```

### convertHtmlToJson - JSON 변환

HTML 문자열을 JSONContent로 변환합니다.

```tsx
import { convertHtmlToJson } from '@0ffen/white-editor';

const htmlString = '<h1>제목</h1><p>본문 내용</p>';
const jsonContent = convertHtmlToJson(htmlString);
console.log(jsonContent);
// {
//   type: 'doc',
//   content: [
//     { type: 'heading', attrs: { level: 1 }, content: [...] },
//     { type: 'paragraph', content: [...] }
//   ]
// }
```

### getGeneratedText - 텍스트 추출

JSONContent에서 순수 텍스트만 추출합니다.

```tsx
import { getGeneratedText } from '@0ffen/white-editor';

const jsonContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Hello World' }],
    },
  ],
};

const text = getGeneratedText(jsonContent);
console.log(text); // 'Hello World'
```

### createEmptyContent - 빈 콘텐츠 생성

간단한 빈 콘텐츠를 생성하는 유틸리티 함수입니다.
빈 JSONContent 값을 입력해야 할 때 사용합니다.

```tsx
import { createEmptyContent } from '@0ffen/white-editor';

const emptyContent = createEmptyContent();
// {
//   type: 'doc',
//   content: [],
// }
```

### markdownToHtml - Markdown 변환

Markdown 문자열을 HTML 문자열로 변환합니다.

```tsx
import { markdownToHtml, convertHtmlToJson, createEmptyContent } from '@0ffen/white-editor';

const markdown = '# 제목\n\n본문 내용입니다.';
const html = markdownToHtml(markdown);
const jsonContent = html ? convertHtmlToJson(html) : createEmptyContent();
```

## 6. 예제

버전 1.1.10의 모든 새 기능을 포함한 종합 예제입니다.

```tsx
import { useRef, lazy, Suspense } from 'react';
import { WhiteEditor, type WhiteEditorRef } from '@0ffen/white-editor';
import type { JSONContent } from '@0ffen/white-editor';

// 동적 임포트 (SSR 비활성화)
const BaseWhiteEditor = lazy(() =>
  import('@0ffen/white-editor').then((mod) => ({ default: mod.WhiteEditor }))
);

interface User {
  userId: string;
  username: string;
  displayName: string;
}

interface Page {
  pageId: string;
  title: string;
  url: string;
  path?: string;
}

function CompleteExample() {
  const editorRef = useRef<WhiteEditorRef>(null);

  const users: User[] = [
    { userId: '1', username: 'white', displayName: 'White Lee' },
    { userId: '2', username: 'black', displayName: 'Black Kim' },
  ];

  const pages: Page[] = [
    { pageId: '1', title: '프로젝트 개요', url: '/pages/1', path: '/docs/project' },
    { pageId: '2', title: 'API 문서', url: '/pages/2', path: '/docs/api' },
  ];

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return data.url;
  };

  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <BaseWhiteEditor
        ref={editorRef}
        // 테마 설정 (객체로 커스터마이징)
        theme={{
          mode: 'dark',
          colors: {
            background: 'var(--color-elevation-background)',
            foreground: 'var(--color-text-normal)',
            popover: 'var(--color-elevation-dropdown)',
            popoverForeground: 'var(--color-text-normal)',
            card: 'var(--color-elevation-level1)',
            cardForeground: 'var(--color-text-normal)',
            primary: 'var(--color-brand-default)',
            primaryForeground: 'var(--color-white)',
            secondary: 'var(--color-elevation-level2)',
            secondaryForeground: 'var(--color-text-sub)',
            muted: 'var(--color-elevation-level2)',
            mutedForeground: 'var(--color-text-normal)',
            accent: 'var(--color-brand-weak)',
            accentForeground: 'var(--color-text-normal)',
          },
        }}
        // UI 설정
        showToolbar={true}
        placeholder="내용을 입력해주세요."
        editorClassName={'!rounded-xs !border'}
        contentClassName="min-h-[500px] p-4"
        // 툴바 설정
        toolbarItems={[
          ['undo', 'redo'],
          ['heading', 'bold', 'italic', 'underline'],
          ['link', 'image'],
        ]}
        toolbarProps={{
          heading: {
            options: [
              { label: '본문', level: null },
              { label: '제목 1', level: 1 },
              { label: '제목 2', level: 2 },
            ],
          },
          image: {
            maxSize: 1024 * 1024 * 10,
            accept: 'image/*',
          },
        }}
        // 확장 기능
        extension={{
          mention: {
            data: users,
            id: 'userId',
            label: 'username',
          },
          pageMention: {
            data: pages,
            id: 'pageId',
            title: 'title',
            href: 'url',
            path: 'path',
          },
          character: {
            show: true,
            limit: 2000,
            className: 'text-gray-600',
          },
          imageUpload: {
            upload: handleImageUpload,
            onSuccess: (url) => {
              console.log('이미지 업로드 성공:', url);
            },
            onError: (error) => {
              console.error('이미지 업로드 실패:', error);
            },
          },
        }}
        // 이벤트 핸들러
        onChange={(content: JSONContent) => {
          console.log('콘텐츠 변경:', content);
        }}
        onFocus={() => {
          console.log('에디터 포커스');
        }}
        onBlur={() => {
          console.log('에디터 블러');
        }}
        onCreate={(editor) => {
          editorRef.current.setContent({});
        }}
        // Footer
        footer={
            <button onClick={() => console.log(editorRef.current?.getJSON())}>
              저장
            </button>
        }
      />
    </Suspense>
  );
}
```

### 간단한 예제 (툴바 없이)

툴바를 숨기고 간단한 입력만 가능한 에디터입니다.

```tsx
<WhiteEditor
  showToolbar={false}
  placeholder="내용을 입력해주세요."
  extension={{
    character: {
      show: true,
      limit: 500,
    },
  }}
/>
```
