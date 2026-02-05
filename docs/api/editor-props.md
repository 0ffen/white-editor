# Editor Props

WhiteEditor 컴포넌트의 모든 Props를 설명합니다.

## WhiteEditorProps

메인 에디터 컴포넌트의 모든 Props를 포함합니다.

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

## UI Props

### theme

- **타입:** `'light' | 'dark'`
- **기본값:** `'light'`

에디터의 테마를 설정합니다.

```tsx
<WhiteEditor theme='dark' />
```

### editorClassName

- **타입:** `string`
- **기본값:** `undefined`

에디터 전체 컨테이너의 CSS 클래스를 설정합니다.

```tsx
<WhiteEditor editorClassName='border rounded-lg shadow-lg' />
```

### contentClassName

- **타입:** `string`
- **기본값:** `undefined`

에디터 콘텐츠 영역의 CSS 클래스를 설정합니다.

```tsx
<WhiteEditor contentClassName='min-h-[500px] p-4' />
```

### toolbarItems

- **타입:** `ToolbarItem[][]`
- **기본값:** `DEFAULT_TOOLBAR_ITEMS`

툴바 버튼을 그룹화하여 설정합니다.

```tsx
<WhiteEditor
  toolbarItems={[
    ['undo', 'redo'],
    ['bold', 'italic', 'underline'],
    ['link', 'image'],
  ]}
/>
```

사용 가능한 아이템:

- `undo`, `redo`
- `heading`
- `bold`, `italic`, `underline`, `strike`, `code`
- `color`, `highlight`
- `textAlignLeft`, `textAlignCenter`, `textAlignRight`, `textAlignJustify`
- `bulletList`, `orderedList`, `taskList`
- `blockquote`
- `codeblock`
- `link`, `table`, `image`
- `inlineMath`, `blockMath`

### toolbarProps

- **타입:** `ToolbarItemProps`
- **기본값:** `{}`

각 툴바 아이템의 동작과 스타일을 커스터마이징합니다.

```tsx
<WhiteEditor
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
      upload: async (file) => {
        return imageUrl;
      },
    },
  }}
/>
```

### footer

- **타입:** `React.ReactNode`
- **기본값:** `undefined`

에디터 하단에 커스텀 요소를 추가합니다.

```tsx
<WhiteEditor
  footer={
    <div className='flex justify-end p-2'>
      <button>저장</button>
    </div>
  }
/>
```

## Extension Props

### extension.mention

- **타입:** `MentionConfig<T>`
- **기본값:** `undefined`

멘션 기능을 설정합니다.

```tsx
<WhiteEditor
  extension={{
    mention: {
      data: users,
      id: 'userId',
      label: 'username',
    },
  }}
/>
```

#### MentionConfig

```tsx
interface MentionConfig<T> {
  data: T[];
  id: keyof T;
  label: keyof T;
}
```

### extension.character

- **타입:** `CharacterConfig`
- **기본값:** `undefined`

글자수 카운트 기능을 설정합니다.

```tsx
<WhiteEditor
  extension={{
    character: {
      show: true,
      limit: 1000,
      className: 'text-gray-600',
    },
  }}
/>
```

#### CharacterConfig

```tsx
interface CharacterConfig {
  show?: boolean;
  limit?: number;
  className?: string;
}
```

## TipTap Editor Options

### content

- **타입:** `Content | JSONContent`
- **기본값:** `undefined`

에디터의 초기 콘텐츠를 설정합니다.

```tsx
<WhiteEditor
  content={{
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '초기 내용' }],
      },
    ],
  }}
/>
```

### autofocus

- **타입:** `boolean | 'start' | 'end' | number`
- **기본값:** `false`

에디터가 마운트될 때 자동으로 포커스됩니다.

```tsx
<WhiteEditor autofocus='end' />
```

### editable

- **타입:** `boolean`
- **기본값:** `true`

에디터의 편집 가능 여부를 설정합니다.

```tsx
<WhiteEditor editable={false} />
```

## 이벤트 핸들러

### onChange

- **타입:** `(jsonContent: JSONContent) => void`

콘텐츠가 변경될 때 호출됩니다.

```tsx
<WhiteEditor
  onChange={(content) => {
    console.log('Content changed:', content);
  }}
/>
```

### onUpdate

- **타입:** `(jsonContent: JSONContent) => void`

에디터가 업데이트될 때마다 호출됩니다 (실시간).

```tsx
<WhiteEditor
  onUpdate={(content) => {
    console.log('Real-time update:', content);
  }}
/>
```

### onFocus

- **타입:** `(jsonContent: JSONContent) => void`

에디터가 포커스될 때 호출됩니다.

```tsx
<WhiteEditor
  onFocus={(content) => {
    console.log('Editor focused');
  }}
/>
```

### onBlur

- **타입:** `(jsonContent: JSONContent) => void`

에디터가 포커스를 잃을 때 호출됩니다.

```tsx
<WhiteEditor
  onBlur={(content) => {
    console.log('Editor blurred');
  }}
/>
```

### onCreate

- **타입:** `(editor: Editor) => void`

에디터가 생성될 때 호출됩니다. Editor 인스턴스를 받습니다.

```tsx
<WhiteEditor
  onCreate={(editor) => {
    console.log('Editor instance:', editor);
  }}
/>
```

### onDestroy

- **타입:** `() => void`

에디터가 파괴될 때 호출됩니다.

```tsx
<WhiteEditor
  onDestroy={() => {
    console.log('Editor destroyed');
  }}
/>
```

### onSelectionUpdate

- **타입:** `(editor: Editor) => void`

선택 영역이 변경될 때 호출됩니다.

```tsx
<WhiteEditor
  onSelectionUpdate={(editor) => {
    console.log('Selection updated');
  }}
/>
```

## 완전한 예제

```tsx
import { useState } from 'react';
import { WhiteEditor, createEmptyContent } from '@0ffen/white-editor';
import type { JSONContent, Editor } from '@0ffen/white-editor';

function CompleteExample() {
  const [content, setContent] = useState<JSONContent>(createEmptyContent());
  const [editor, setEditor] = useState<Editor | null>(null);

  return (
    <WhiteEditor
      theme='light'
      editorClassName='border rounded-lg'
      contentClassName='min-h-[400px] p-4'
      content={content}
      autofocus='end'
      toolbarItems={[
        ['undo', 'redo'],
        ['heading', 'bold', 'italic', 'color'],
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
          maxSize: 1024 * 1024 * 5,
          accept: 'image/*',
          upload: async (file) => {
            const url = await uploadToServer(file);
            return url;
          },
        },
      }}
      extension={{
        mention: {
          data: users,
          id: 'id',
          label: 'name',
        },
        character: {
          show: true,
          limit: 1000,
        },
      }}
      onChange={setContent}
      onCreate={setEditor}
      onFocus={() => console.log('Focused')}
      onBlur={() => console.log('Blurred')}
      footer={
        <div className='flex justify-end gap-2 p-2'>
          <button onClick={() => handleSave(content)}>저장</button>
        </div>
      }
    />
  );
}
```

## 참고

- [Viewer Props](/api/viewer) - Viewer 컴포넌트 Props
- [Types](/api/types) - 타입 정의
- [Utilities](/api/utilities) - 유틸리티 함수
