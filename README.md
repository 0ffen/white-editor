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
  theme?: 'light' | 'dark'; // 테마 설정
  disabled?: boolean; // 에디터 비활성화 여부
  editorClassName?: string; // 에디터 전체 스타일
  contentClassName?: string; // 에디터 내용 영역 스타일
  toolbarItems?: ToolbarItem[][]; // 툴바 버튼 그룹 설정
  toolbarProps?: ToolbarItemProps; // 각 툴바 버튼의 상세 옵션
  footer?: React.ReactNode; // 에디터 하단 커스텀 영역
  placeholder?: string; // 에디터가 비어있을 때 표시할 텍스트
}
```

#### WhiteEditorExtensions

에디터 확장 기능 설정

```ts
interface WhiteEditorExtensions<T> {
  extension?: {
    mention?: MentionConfig<T>; // @멘션 기능을 위한 멘션 옵션 설정
    character?: {
      //글자수 카운트를 위한 옵션 설정
      show?: boolean;
      limit?: number; //limit을 작성하지 않으면 count만 노출
      className?: string;
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

## 3. 에디터 제어

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

## 4. Utilities

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

### setCSSVariables - CSS 변수 커스텀

스타일 변수를 커스터마이징할 수 있게 해주는 유틸 함수입니다.
변경하고 싶은 컬러의 변수를 수정해주세요.
에디터의 컬러는 [shadcn ui](https://ui.shadcn.com/themes)의 variable을 따릅니다.

```tsx
import { useEffect } from 'react';
import { WhiteEditor, setCSSVariables } from '@0ffen/white-editor';

function MyComponent() {
  useEffect(() => {
    setCSSVariables({
      '--primary': '#000000',
      '--secondary': '#000000',
      '--background': '#000000',
      '--border': '#000000',
    });
  }, []);

<WhiteEditor />;
```
