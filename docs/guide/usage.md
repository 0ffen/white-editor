# 기본 사용법

White Editor의 기본적인 사용법과 주요 기능을 소개합니다.

## WhiteEditor 컴포넌트

에디터의 메인 컴포넌트입니다.

```tsx
import { WhiteEditor } from '@0ffen/white-editor';
import type { JSONContent } from '@0ffen/white-editor';

function MyEditor() {
  const handleChange = (content: JSONContent) => {
    console.log('Content:', content);
  };

  return <WhiteEditor onChange={handleChange} contentClassName='h-96' theme='light' />;
}
```

## 콘텐츠 관리

### 초기 콘텐츠 설정

```tsx
import { WhiteEditor } from '@0ffen/white-editor';
import type { JSONContent } from '@0ffen/white-editor';

const initialContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: '제목' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: '내용입니다.' }],
    },
  ],
};

function MyEditor() {
  return <WhiteEditor content={initialContent} />;
}
```

### 빈 콘텐츠 생성

```tsx
import { WhiteEditor, createEmptyContent } from '@0ffen/white-editor';

function MyEditor() {
  return <WhiteEditor content={createEmptyContent()} />;
}
```

## 이벤트 핸들러

에디터는 다양한 이벤트 핸들러를 제공합니다.

```tsx
<WhiteEditor
  onChange={(content) => {
    console.log('Content changed:', content);
  }}
  onUpdate={(content) => {
    console.log('Real-time update:', content);
  }}
  onFocus={(content) => {
    console.log('Editor focused');
  }}
  onBlur={(content) => {
    console.log('Editor blurred');
  }}
  onCreate={(editor) => {
    console.log('Editor created:', editor);
  }}
/>
```

## 스타일 커스터마이징

### 클래스명으로 스타일 적용

```tsx
<WhiteEditor editorClassName='border rounded-lg shadow-lg' contentClassName='min-h-[400px] p-4' />
```

### 테마 설정

```tsx
<WhiteEditor theme='dark' />
```

## WhiteViewer 컴포넌트

저장된 콘텐츠를 읽기 전용으로 표시합니다.

```tsx
import { WhiteViewer } from '@0ffen/white-editor';
import type { JSONContent } from '@0ffen/white-editor';

const content: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: '표시할 내용' }],
    },
  ],
};

function MyViewer() {
  return <WhiteViewer content={content} className='prose max-w-none' />;
}
```

## 에디터 + 뷰어 실시간 연동

에디터와 뷰어를 함께 사용하여 실시간으로 결과를 확인할 수 있습니다.

```tsx
import { useState } from 'react';
import { WhiteEditor, WhiteViewer, createEmptyContent } from '@0ffen/white-editor';
import type { JSONContent } from '@0ffen/white-editor';

function App() {
  const [content, setContent] = useState<JSONContent>(createEmptyContent());

  return (
    <div className='grid grid-cols-2 gap-4'>
      <div>
        <h2>Editor</h2>
        <WhiteEditor contentClassName='h-96' onChange={(content) => setContent(content)} />
      </div>

      <div>
        <h2>Preview</h2>
        <WhiteViewer content={content} className='h-96 rounded-lg border p-4' />
      </div>
    </div>
  );
}
```

## 푸터 커스터마이징

에디터 하단에 커스텀 요소를 추가할 수 있습니다.

```tsx
<WhiteEditor
  footer={
    <div className='flex justify-end gap-2 p-2'>
      <button onClick={() => console.log('취소')}>취소</button>
      <button onClick={() => console.log('저장')}>저장</button>
    </div>
  }
/>
```

## 다음 단계

- [툴바 커스터마이징](/guide/toolbar) - 툴바 버튼을 설정합니다.
- [확장 기능](/guide/extensions) - 멘션, 글자수 제한 등을 설정합니다.
- [에디터 제어](/guide/editor-control) - 에디터를 프로그래밍 방식으로 제어합니다.
