# Types

White Editor에서 사용하는 주요 타입 정의를 설명합니다.

## Editor 타입

### Editor

TipTap의 Editor 인스턴스 타입입니다.

```tsx
import type { Editor } from '@0ffen/white-editor';

const [editor, setEditor] = useState<Editor | null>(null);
```

### JSONContent

에디터의 콘텐츠를 나타내는 JSON 객체 타입입니다.

```tsx
import type { JSONContent } from '@0ffen/white-editor';

const content: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: '안녕하세요' }],
    },
  ],
};
```

#### 구조

```tsx
interface JSONContent {
  type: string;
  attrs?: Record<string, unknown>;
  content?: JSONContent[];
  marks?: Array<{
    type: string;
    attrs?: Record<string, unknown>;
  }>;
  text?: string;
}
```

## Props 타입

### WhiteEditorProps

```tsx
interface WhiteEditorProps<T> extends WhiteEditorUIProps, WhiteEditorExtensions<T>, TipTapEditorOptions {
  onChange?: (jsonContent: JSONContent) => void;
  onUpdate?: (jsonContent: JSONContent) => void;
  onFocus?: (jsonContent: JSONContent) => void;
  onBlur?: (jsonContent: JSONContent) => void;
  onCreate?: (editor: Editor) => void;
  onDestroy?: () => void;
  onSelectionUpdate?: (editor: Editor) => void;
  editorProps?: EditorProps;
}
```

### WhiteEditorUIProps

```tsx
interface WhiteEditorUIProps {
  theme?: 'light' | 'dark';
  editorClassName?: string;
  contentClassName?: string;
  toolbarItems?: ToolbarItem[][];
  toolbarProps?: ToolbarItemProps;
  footer?: React.ReactNode;
}
```

### WhiteEditorExtensions

```tsx
interface WhiteEditorExtensions<T> {
  extension?: {
    mention?: MentionConfig<T>;
    character?: {
      show?: boolean;
      limit?: number;
      className?: string;
    };
  };
}
```

### TipTapEditorOptions

```tsx
interface TipTapEditorOptions {
  content?: Content;
  autofocus?: boolean | 'start' | 'end' | number;
  editable?: boolean;
  injectCSS?: boolean;
  injectNonce?: string;
  parseOptions?: Record<string, unknown>;
  enableInputRules?: boolean;
  enablePasteRules?: boolean;
  enableCoreExtensions?: boolean;
  immediatelyRender?: boolean;
  shouldRerenderOnTransaction?: boolean;
}
```

## Toolbar 타입

### ToolbarItem

```tsx
type ToolbarItem =
  | 'undo'
  | 'redo'
  | 'heading'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'
  | 'color'
  | 'highlight'
  | 'textAlignLeft'
  | 'textAlignCenter'
  | 'textAlignRight'
  | 'textAlignJustify'
  | 'bulletList'
  | 'orderedList'
  | 'taskList'
  | 'blockquote'
  | 'codeblock'
  | 'link'
  | 'table'
  | 'image'
  | 'inlineMath'
  | 'blockMath';
```

### ToolbarItemProps

```tsx
interface ToolbarItemProps {
  heading?: HeadingDropdownMenuProps;
  image?: ImageDialogProps;
  bold?: ButtonProps;
  italic?: ButtonProps;
  underline?: ButtonProps;
  strike?: ButtonProps;
  code?: ButtonProps;
  color?: ColorPopoverProps;
  highlight?: HighlightPopoverProps;
}
```

### HeadingDropdownMenuProps

```tsx
interface HeadingOption {
  label: string;
  level: 1 | 2 | 3 | 4 | 5 | 6 | null;
}

interface HeadingDropdownMenuProps {
  options?: HeadingOption[];
  icon?: React.ReactNode;
  triggerClassName?: string;
  contentClassName?: string;
}
```

## Extension 타입

### MentionConfig

```tsx
interface MentionConfig<T> {
  data: T[];
  id: keyof T;
  label: keyof T;
}
```

사용 예제:

```tsx
interface User {
  userId: string;
  username: string;
  email: string;
}

const mentionConfig: MentionConfig<User> = {
  data: users,
  id: 'userId',
  label: 'username',
};
```

## Image 타입

### ImageDialogProps

```tsx
interface ImageDialogProps {
  maxSize?: number;
  accept?: string;
  serverAPI?: ImageServerAPI;
  upload?: (file: File) => Promise<string>;
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}
```

### ImageServerAPI

```tsx
interface ImageServerAPI {
  upload: (file: File) => Promise<UploadResponse>;
  delete?: (id: string) => Promise<boolean>;
}

interface UploadResponse {
  success: boolean;
  url: string;
  id?: string;
  error?: string;
}
```

## Viewer 타입

### WhiteViewerProps

```tsx
interface WhiteViewerProps {
  content: JSONContent;
  className?: string;
}
```

## 노드 타입 예제

### Heading

```tsx
const heading: JSONContent = {
  type: 'heading',
  attrs: { level: 1 },
  content: [{ type: 'text', text: '제목 1' }],
};
```

### Paragraph

```tsx
const paragraph: JSONContent = {
  type: 'paragraph',
  content: [{ type: 'text', text: '일반 텍스트' }],
};
```

### Bold Text

```tsx
const boldText: JSONContent = {
  type: 'paragraph',
  content: [
    {
      type: 'text',
      text: '굵은 텍스트',
      marks: [{ type: 'bold' }],
    },
  ],
};
```

### Link

```tsx
const link: JSONContent = {
  type: 'paragraph',
  content: [
    {
      type: 'text',
      text: '링크 텍스트',
      marks: [
        {
          type: 'link',
          attrs: { href: 'https://example.com' },
        },
      ],
    },
  ],
};
```

### Image

```tsx
const image: JSONContent = {
  type: 'resizableImage',
  attrs: {
    src: 'https://example.com/image.jpg',
    alt: '이미지 설명',
    width: 500,
    height: 300,
  },
};
```

### Bullet List

```tsx
const bulletList: JSONContent = {
  type: 'bulletList',
  content: [
    {
      type: 'listItem',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '첫 번째 항목' }],
        },
      ],
    },
    {
      type: 'listItem',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '두 번째 항목' }],
        },
      ],
    },
  ],
};
```

### Code Block

```tsx
const codeBlock: JSONContent = {
  type: 'codeBlock',
  attrs: { language: 'javascript' },
  content: [
    {
      type: 'text',
      text: 'const hello = "world";',
    },
  ],
};
```

### Table

```tsx
const table: JSONContent = {
  type: 'table',
  content: [
    {
      type: 'tableRow',
      content: [
        {
          type: 'tableHeader',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '헤더 1' }],
            },
          ],
        },
        {
          type: 'tableHeader',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '헤더 2' }],
            },
          ],
        },
      ],
    },
    {
      type: 'tableRow',
      content: [
        {
          type: 'tableCell',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '셀 1' }],
            },
          ],
        },
        {
          type: 'tableCell',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '셀 2' }],
            },
          ],
        },
      ],
    },
  ],
};
```

## 타입 가드

### JSONContent 검증

```tsx
function isValidJSONContent(value: unknown): value is JSONContent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return typeof obj.type === 'string' && (obj.content === undefined || Array.isArray(obj.content));
}
```

### 사용 예제

```tsx
const data = await fetch('/api/content').then((res) => res.json());

if (isValidJSONContent(data)) {
  return <WhiteViewer content={data} />;
} else {
  console.error('Invalid content format');
}
```

## 참고

- [Editor Props](/api/editor-props) - Editor Props 상세 설명
- [Viewer](/api/viewer) - Viewer Props
- [Utilities](/api/utilities) - 유틸리티 함수
