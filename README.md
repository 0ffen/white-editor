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

**진입점 (Entry points)**  
- `@0ffen/white-editor` — 에디터·뷰어·테마·타입·확장·툴바 프리셋(`WHITE_EDITOR_TOOLBAR_ITEMS`, `DEFAULT_TOOLBAR_ITEMS`, `MINIMAL_TOOLBAR_ITEMS`) (메인)
- `@0ffen/white-editor/util` — 유틸만 (`getHtmlContent`, `createEmptyContent`, `checkEditorEmpty`, `normalizeContentSchema` 등)
- `@0ffen/white-editor/editor` — 에디터 전용
- `@0ffen/white-editor/viewer` — 뷰어 전용

Next.js(App Router), React 19에서 정적 import로 사용할 수 있도록 `"use client"`가 포함되어 있습니다.


### WhiteEditorThemeProvider (theme, zIndex, color)

에디터/뷰어를 감싸는 `WhiteEditorThemeProvider`에서 theme mode(라이트/다크·색상), zIndex, color를 설정할 수 있습니다.

#### Theme Props
```ts
type ThemeProp = 'light' | 'dark' | {
  mode?: 'light' | 'dark';
  colors?: WhiteEditorThemeColors; 
  zIndex?: WhiteEditorThemeZIndex; 
};
```

#### Color (WhiteEditorThemeColors)

지정한 키만 CSS 변수로 적용됩니다.

| 키 | 설명 |
| --- | --- |
| `brandWeak` | 선택/강조 배경 |
| `brandLight` | 선택 테두리, 하이라이트, 버튼 |
| `brandDefault` | 링크/액센트, 도형 선택, 인라인 코드 등 |
| `textNormal` | 본문 텍스트 |
| `textLight` | 보조 텍스트, 이미지 도형 비선택 색 |
| `textSub` | 드롭다운/메뉴 보조 텍스트 |
| `textPlaceholder` | 에디터 플레이스홀더 |
| `elevationBackground` | 에디터/뷰어 배경 |
| `elevationLevel1` | 카드/블록 배경 |
| `elevationLevel2` | 코드블록 배경 등 |
| `elevationDropdown` | 커맨드 리스트·드롭다운 배경 |
| `borderDefault` | 구분선, 핸들, 테두리 |
| `interactionHover` | 호버 배경 |


#### zIndex (WhiteEditorThemeZIndex)

레이어별 z-index를 숫자로 지정합니다. 지정한 항목만 적용됩니다.

| 키 | 타입 | 설명 |
| --- | --- | --- |
| `toolbar` | `number` | 툴바 |
| `inline` | `number` | 멘션 리스트, 스티키 헤더 등 |
| `handle` | `number` | 테이블 열 리사이즈 핸들 |
| `overlay` | `number` | 다이얼로그 배경(오버레이) |
| `floating` | `number` | 드롭다운, 팝오버, 툴팁, 셀렉트, 컨텍스트 메뉴, 다이얼로그 콘텐츠 (overlay보다 큰 값을 입력해주세요) |



```tsx
import { WhiteEditorThemeProvider, WhiteEditor } from '@0ffen/white-editor';

<WhiteEditorThemeProvider
  theme={{
    mode: 'dark',
    colors: {
      textNormal: 'var(--color-text-normal)',
      textPlaceholder: 'var(--color-text-placeholder)',
      elevationBackground: 'var(--color-elevation-background)',
      elevationDropdown: 'var(--color-elevation-dropdown)',
      brandDefault: 'var(--color-brand-default)',
      brandWeak: 'var(--color-brand-weak)',
    },
     zIndex: {
      toolbar: 10,
      inline: 10,
      handle: 10,
      overlay: 10,
      floating: 20,
    },
  }}
>
  <WhiteEditor />
</WhiteEditorThemeProvider>
```

### Fonts

**폰트 CDN 사용 불가(로컬·오프라인)인 경우**  
호스트 앱의 **`public/assets/fonts`** 에 폰트를 두려면 아래 복사 스크립트를 사용하세요.
  - **수동 실행**: `node node_modules/@0ffen/white-editor/scripts/copy-fonts-to-public.cjs`
  - **package.json 예시** (설치 후 매번 복사하려면 `postinstall` 사용):

  ```json
  "scripts": {
    "copy:white-editor-fonts": "node node_modules/@0ffen/white-editor/scripts/copy-fonts-to-public.cjs",
  }
  ```


## 사용 방법

### 1. White Editor

### Next (App Router)

```tsx
'use client';

import { useRef } from 'react';
import { WhiteEditor, type WhiteEditorRef } from '@0ffen/white-editor';

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
    <WhiteEditor ref={editorRef}/>
  );
}
```

### Toolbar
- `showToolbar` : `showToolbar={false}`로 툴바를 숨길 수 있습니다.
  ```tsx
   <WhiteEditor showToolbar={false} placeholder='툴바 없이 간단한 입력만 가능합니다.' />
  ```
- `toolbarItems` : 이중 배열로 툴바 버튼을 그룹화하여 직접 정의할 수 있습니다. (Default: `DEFAULT_TOOLBAR_ITEMS`)

#### 툴바 프리셋 (Preset Toolbar Items)

패키지에서 제공하는 툴바 아이템 배열을 import 해서 그대로 사용할 수 있습니다.

| 이름 | 설명 |
| --- | --- |
| `WHITE_EDITOR_TOOLBAR_ITEMS` | 전체 툴바 버튼이 노출됩니다. undo/redo, heading, list, blockquote, bold/italic/strike/code/underline, color/highlight, textAlign, codeblock, 수식, link, table, image 등 모든 기능을 포함합니다. |
| `DEFAULT_TOOLBAR_ITEMS` | 기본 툴바 구성입니다. heading, color, highlight, link, code/codeblock, blockquote, list, table, image, textAlign 등이 포함됩니다. |
| `MINIMAL_TOOLBAR_ITEMS` | 최소 툴바 구성입니다. heading, color, blockquote, list, table, image, textAlign 만 노출됩니다. |

```tsx
import {
  WhiteEditor,
  WHITE_EDITOR_TOOLBAR_ITEMS,
  DEFAULT_TOOLBAR_ITEMS,
  MINIMAL_TOOLBAR_ITEMS,
} from '@0ffen/white-editor';

// 전체 툴바 (모든 버튼 노출)
<WhiteEditor toolbarItems={WHITE_EDITOR_TOOLBAR_ITEMS} />

// 기본 툴바
<WhiteEditor toolbarItems={DEFAULT_TOOLBAR_ITEMS} />

// 최소 툴바
<WhiteEditor toolbarItems={MINIMAL_TOOLBAR_ITEMS} />
```

#### Custom Toolbar Items (툴바 커스텀)

이중 배열로 툴바 버튼을 그룹화하여 직접 정의할 수 있습니다.

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

#### 국제화 (locale)

에디터 내 툴바 라벨, 플레이스홀더, 버튼 문구 등은 `locale` prop으로 언어를 바꿀 수 있습니다. 지원 값: `'ko'`(한국어, 기본값), `'en'`(영어), `'es'`(스페인어). 지정한 값으로 i18n이 전환되어 해당 언어로 표시됩니다.

```tsx
import { WhiteEditor } from '@0ffen/white-editor';

// 한국어 (기본)
<WhiteEditor locale="ko" placeholder="내용을 입력하세요." />

// 영어
<WhiteEditor locale="en" placeholder="Enter your content." />

// 스페인어
<WhiteEditor locale="es" placeholder="Ingrese su contenido." />
```

동적으로 바꾸려면 상위에서 `locale` 를 prop으로 넘기면 됩니다.

```tsx

<WhiteEditor locale={locale} showToolbar={true} />
```

## Type 
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
  onEmptyChange?: (isEmpty: boolean) => void; // 빈 상태 변경시 (제출 버튼 비활성화 등)
  emptyCheckDebounceMs?: number; // onEmptyChange 디바운스 시간(ms). 0이면 입력할 때마다 즉시. 기본값 200
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
  editorClassName?: string; // 에디터 전체 스타일
  contentClassName?: string; // 에디터 내용 영역 스타일
  toolbarItems?: ToolbarItem[][]; // 툴바 버튼 그룹 설정
  toolbarProps?: ToolbarItemProps; // 각 툴바 버튼의 상세 옵션
  /** @deprecated 다음 마이너 버전에서 제거 필요 */
  theme?: 'light' | 'dark' | WhiteEditorTheme; // 테마 설정
  footer?: React.ReactNode; // 에디터 하단 커스텀 영역
  disabled?: boolean; // 에디터 비활성화 여부
  placeholder?: string; // 에디터가 비어있을 때 표시할 텍스트
  showToolbar?: boolean; // 툴바 표시 여부 (기본값: true)
  /** 국제화 locale (ko | en | es). 지정 시 에디터 내 텍스트가 해당 언어로 동기화됨 */
  locale?: 'ko' | 'en' | 'es'; // 기본값: 'ko'
}

interface WhiteEditorTheme {
  mode?: 'light' | 'dark';
  colors?: WhiteEditorThemeColors;  // textNormal, elevationBackground, brandDefault 등 (WhiteEditorThemeProvider 절 참고)
  zIndex?: WhiteEditorThemeZIndex;  // toolbar, overlay, floating 등 number
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
  isEmpty: boolean; // 빈 상태 확인 (ref는 마운트 이후에만 채워짐)
  clear: () => void; // 콘텐츠 비우기
}
```

#### 에디터 빈 상태 확인

에디터가 비어 있는지 판단해 제출 버튼 비활성화, 폼 검증 등에 사용할 수 있습니다.

**1) onEmptyChange 콜백 (권장)**

입력/삭제 시 빈 상태가 바뀔 때마다 콜백이 호출됩니다. 디바운스로 호출 횟수를 줄일 수 있습니다.

```tsx
import { useState } from 'react';
import { WhiteEditor } from '@0ffen/white-editor';

function FormWithEditor() {
  const [editorEmpty, setEditorEmpty] = useState(true);

  return (
    <form>
      <WhiteEditor
        onEmptyChange={setEditorEmpty}
        emptyCheckDebounceMs={200}
        footer={
          <button type="submit" disabled={editorEmpty}>
            제출
          </button>
        }
      />
    </form>
  );
}
```
- `emptyCheckDebounceMs`: 디바운스 시간(ms). 기본값 `200`. `0`이면 입력할 때마다 즉시 호출.



**2) checkEditorEmpty 유틸 (저장된 필드 검사)**

서버에 저장된 에디터 필드(`{ content?, html? }`)나 폼 초기값이 비어 있는지 검사할 때 사용합니다.

```tsx
import { checkEditorEmpty } from '@0ffen/white-editor/util';

// 저장된 에디터 필드 검사
if (checkEditorEmpty(formData.body)) {
  setError('내용을 입력해 주세요.');
}

// ref로 현재 에디터 내용 검사 (이벤트 핸들러 등에서, 마운트 이후)
const isEmpty = editorRef.current ? checkEditorEmpty({ content: editorRef.current.getJSON() }) : true;
```

**3) ref.current.isEmpty**

ref를 통해 현재 에디터의 빈 상태를 읽을 수 있습니다. ref는 **에디터가 마운트된 뒤**에만 채워지므로, 렌더 단계가 아닌 이벤트 핸들러나 `useEffect` 안에서 사용하세요.

```tsx
const handleSubmit = () => {
  if (editorRef.current?.isEmpty) {
    alert('내용을 입력해 주세요.');
    return;
  }
  // 제출 처리
};
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
        <div className='flex items-center gap-2'>
          {item.icon && <img src={item.icon} alt='' />}
          <span>{item.title}</span>
        </div>
      ), // optional
    },
  }}
/>;
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
/>;
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
/>;
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

<WhiteEditor customNodes={[CustomNode]} />;
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
/>;
```

커스텀 노드 뷰 컴포넌트 예제:

```tsx
import React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';

const CustomCodeBlock: React.FC<NodeViewProps> = ({ node }) => {
  return (
    <NodeViewWrapper className='custom-code-block'>
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
/>;
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

아래 유틸은 진입점 **`@0ffen/white-editor/util`** 에서 import합니다. 예시 코드의 import 경로를 그대로 사용하면 됩니다.

### getHtmlContent - HTML 변환

JSONContent를 HTML 문자열로 변환합니다.

```tsx
import { useRef } from 'react';
import { WhiteEditor, type WhiteEditorRef } from '@0ffen/white-editor';
import { getHtmlContent } from '@0ffen/white-editor/util';

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
import { convertHtmlToJson } from '@0ffen/white-editor/util';

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
import { getGeneratedText } from '@0ffen/white-editor/util';

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
import { createEmptyContent } from '@0ffen/white-editor/util';

const emptyContent = createEmptyContent();
// {
//   type: 'doc',
//   content: [],
// }
```

### checkEditorEmpty - 에디터 필드 빈 값 확인

저장된 에디터 필드(`{ content?: JSONContent; html?: string }`)가 비어 있는지 확인합니다. 폼 검증, 제출 전 검사에 사용합니다. 이미지·코드 블록 등 텍스트가 없어도 내용이 있을 수 있으므로 JSON 구조를 기준으로 판단합니다.

```tsx
import { checkEditorEmpty } from '@0ffen/white-editor/util';

// 저장된 필드 검사
if (checkEditorEmpty(formData.body)) {
  setError('내용을 입력해 주세요.');
}

// content만 넘겨도 됨
const isEmpty = checkEditorEmpty({ content: editorRef.current?.getJSON() });
```

### markdownToHtml - Markdown 변환

Markdown 문자열을 HTML 문자열로 변환합니다.

```tsx
import { markdownToHtml, convertHtmlToJson, createEmptyContent } from '@0ffen/white-editor/util';

const markdown = '# 제목\n\n본문 내용입니다.';
const html = markdownToHtml(markdown);
const jsonContent = html ? convertHtmlToJson(html) : createEmptyContent();
```

## 6. 예제

버전 1.1.10의 모든 새 기능을 포함한 종합 예제입니다.

```tsx
import { useRef, useState } from 'react';
import { WhiteEditor, WhiteEditorThemeProvider, type WhiteEditorRef } from '@0ffen/white-editor';
import { createEmptyContent } from '@0ffen/white-editor/util';
import type { JSONContent } from '@tiptap/react';

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
  const [editorEmpty, setEditorEmpty] = useState(true);

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
    const response = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await response.json();
    return data.url;
  };

  return (
    <WhiteEditorThemeProvider
      theme={{
        mode: 'dark',
        colors: {
          textNormal: 'var(--color-text-normal)',
          textPlaceholder: 'var(--color-text-placeholder)',
          elevationBackground: 'var(--color-elevation-background)',
          elevationLevel1: 'var(--color-elevation-level1)',
          elevationDropdown: 'var(--color-elevation-dropdown)',
          brandDefault: 'var(--color-brand-default)',
          brandWeak: 'var(--color-brand-weak)',
        },
        zIndex: {}, // 필요 시 toolbar, overlay, floating 등 오버라이드
      }}
    >
      <WhiteEditor
        ref={editorRef}
        // 국제화 (ko | en | es)
        locale="ko"
        // UI 설정
        showToolbar={true}
        placeholder="내용을 입력해주세요."
        editorClassName="!rounded-xs !border"
        contentClassName="min-h-[500px] p-4"
        disabled={false}
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
            onSuccess: (url) => console.log('이미지 업로드 성공:', url),
            onError: (error) => console.error('이미지 업로드 실패:', error),
          },
        }}
        // 빈 상태 감지 (제출 버튼 비활성화 등)
        onEmptyChange={setEditorEmpty}
        emptyCheckDebounceMs={200}
        // 이벤트 핸들러
        onChange={(content: JSONContent) => console.log('콘텐츠 변경:', content)}
        onFocus={() => console.log('에디터 포커스')}
        onBlur={() => console.log('에디터 블러')}
        onCreate={(editor) => {
          editorRef.current?.setContent(createEmptyContent());
        }}
        // Footer (빈 상태일 때 제출 비활성화 예시)
        footer={
          <button
            disabled={editorEmpty}
            onClick={() => console.log(editorRef.current?.getJSON())}
          >
            저장
          </button>
        }
      />
    </WhiteEditorThemeProvider>
  );
}
```

### 간단한 예제 (툴바 없이)

툴바를 숨기고 간단한 입력만 가능한 에디터입니다.

```tsx
<WhiteEditor
  showToolbar={false}
  placeholder='내용을 입력해주세요.'
  extension={{
    character: {
      show: true,
      limit: 500,
    },
  }}
/>
```
