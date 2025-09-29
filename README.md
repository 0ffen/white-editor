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
pnpm install @enki/white-editor
# or
yarn add @enki/white-editor
```

## 사용 방법

### 1. White Editor

```tsx
import { WhiteEditor } from '@enki/white-editor';

<WhiteEditor
  theme={'light'}
  editorClassName={'white-editor-class'}
  contentClassName={'content-class'}
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
  onChange={(content: JSONContent) => {
    console.log('onChange', content);
  }}
/>;
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
}
```

#### WhiteEditorUIProps

에디터의 외관과 툴바 설정을 담당

```ts
interface WhiteEditorUIProps {
  theme?: 'light' | 'dark'; // 테마 설정
  editorClassName?: string; // 에디터 전체 스타일
  contentClassName?: string; // 에디터 내용 영역 스타일
  toolbarItems?: ToolbarItem[][]; // 툴바 버튼 그룹 설정
  toolbarProps?: ToolbarItemProps; // 각 툴바 버튼의 상세 옵션
  footer?: React.ReactNode; // 에디터 하단 커스텀 영역
}
```

#### WhiteEditorExtensions

에디터 확장 기능 설정

```ts
interface WhiteEditorExtensions<T> {
  extension?: {
    mention?: MentionConfig<T>; // @멘션 기능을 위한 멘션 옵션 설정
  };
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

이미지 업로드는 다음 우선순위로 처리됩니다:

1. `serverAPI` - 서버 API 객체가 있으면 우선 사용
2. `upload` - 커스텀 업로드 함수 사용
3. **기본값** - 개발환경에서는 로컬 URL 생성

```tsx
toolbarProps: {
  image: {
    maxSize: 1024 * 1024 * 10,       // 파일 크기 제한 (기본: 5MB)
    accept: 'image/*',               // 허용 파일 타입

    // 서버 API (권장)
    serverAPI: {
      upload: async (file) => ({
        success: true,
        url: 'https://server.com/image.jpg'
      }),
      delete: async (id) => true,    // 이미지 삭제
    },

    // 또는 단순 업로드 함수
    upload: async (file) => imageUrl,

    onSuccess: (url) => console.log(url),
    onError: (error) => console.error(error),
  },
}
```

## 2. Editor Viewer

읽기 전용 뷰어 컴포넌트

```tsx
import { EditorViewer, type JSONContent } from '@enki/white-editor';

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

<EditorViewer content={sampleContent} className='prose max-w-none' />;
```

## 3. 에디터 제어

### onCreate 콜백

```tsx
import { useState } from 'react';
import { WhiteEditor, Editor } from '@enki/white-editor';

function MyComponent() {
  const [editor, setEditor] = useState<Editor | null>(null);

  const insertText = () => {
    editor?.commands.insertContent('Hello World!');
  };

  return (
    <div>
      <WhiteEditor onCreate={(editorInstance) => setEditor(editorInstance)} />
      <button onClick={insertText}>텍스트 삽입</button>
    </div>
  );
}
```

## 4. Utilities

### HTML 변환

JSONContent를 HTML 문자열로 변환합니다.

```tsx
import { WhiteEditor, getHtmlContent } from '@enki/white-editor';

<WhiteEditor
  onChange={(content) => {
    const html = getHtmlContent(content);
    console.log(html); // <h1>제목</h1><p>본문</p>
  }}
/>;
```

return

```
 <h1>h1</h1><p>paragraph</p><p></p>
```
