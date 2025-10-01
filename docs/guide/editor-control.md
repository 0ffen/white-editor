# 에디터 제어

White Editor를 프로그래밍 방식으로 제어하는 방법을 안내합니다.

## onCreate 콜백

에디터가 생성될 때 Editor 인스턴스를 가져올 수 있습니다.

```tsx
import { useState } from 'react';
import { WhiteEditor } from '@0ffen/white-editor';
import type { Editor } from '@0ffen/white-editor';

function MyComponent() {
  const [editor, setEditor] = useState<Editor | null>(null);

  return (
    <WhiteEditor
      onCreate={(editorInstance) => {
        setEditor(editorInstance);
        console.log('Editor created:', editorInstance);
      }}
    />
  );
}
```

## 커맨드 실행

Editor 인스턴스를 통해 다양한 커맨드를 실행할 수 있습니다.

### 텍스트 삽입

```tsx
function MyComponent() {
  const [editor, setEditor] = useState<Editor | null>(null);

  const insertText = () => {
    editor?.commands.insertContent('Hello World!');
  };

  return (
    <div>
      <WhiteEditor onCreate={setEditor} />
      <button onClick={insertText}>텍스트 삽입</button>
    </div>
  );
}
```

### HTML 삽입

```tsx
const insertHTML = () => {
  editor?.commands.insertContent('<h1>제목</h1><p>내용</p>');
};
```

### JSON 콘텐츠 삽입

```tsx
const insertJSON = () => {
  editor?.commands.insertContent({
    type: 'paragraph',
    content: [{ type: 'text', text: '안녕하세요' }],
  });
};
```

## 스타일 적용

### 텍스트 포맷

```tsx
const makeBold = () => {
  editor?.commands.toggleBold();
};

const makeItalic = () => {
  editor?.commands.toggleItalic();
};

const makeUnderline = () => {
  editor?.commands.toggleUnderline();
};
```

### 제목 설정

```tsx
const setHeading1 = () => {
  editor?.commands.setHeading({ level: 1 });
};

const setHeading2 = () => {
  editor?.commands.setHeading({ level: 2 });
};

const setParagraph = () => {
  editor?.commands.setParagraph();
};
```

### 텍스트 색상

```tsx
const setTextColor = (color: string) => {
  editor?.commands.setColor(color);
};

const setHighlight = (color: string) => {
  editor?.commands.setHighlight({ color });
};
```

## 콘텐츠 가져오기

### JSON 콘텐츠 가져오기

```tsx
const getContent = () => {
  const json = editor?.getJSON();
  console.log(json);
  return json;
};
```

### HTML 가져오기

```tsx
const getHTML = () => {
  const html = editor?.getHTML();
  console.log(html);
  return html;
};
```

### 텍스트만 가져오기

```tsx
const getText = () => {
  const text = editor?.getText();
  console.log(text);
  return text;
};
```

## 콘텐츠 설정

### JSON으로 설정

```tsx
const setContent = () => {
  editor?.commands.setContent({
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: '새 제목' }],
      },
    ],
  });
};
```

### HTML로 설정

```tsx
const setHTML = () => {
  editor?.commands.setContent('<h1>새 제목</h1><p>새 내용</p>');
};
```

## 포커스 제어

```tsx
const focusEditor = () => {
  editor?.commands.focus();
};

const blurEditor = () => {
  editor?.commands.blur();
};

const focusEnd = () => {
  editor?.commands.focus('end');
};
```

## 선택 영역 제어

```tsx
const selectAll = () => {
  editor?.commands.selectAll();
};

const deleteSelection = () => {
  editor?.commands.deleteSelection();
};
```

## 실행 취소/다시 실행

```tsx
const undo = () => {
  editor?.commands.undo();
};

const redo = () => {
  editor?.commands.redo();
};
```

## 에디터 상태 확인

### 스타일 활성 상태 확인

```tsx
const isBold = editor?.isActive('bold');
const isItalic = editor?.isActive('italic');
const isHeading1 = editor?.isActive('heading', { level: 1 });
```

### 편집 가능 여부 확인

```tsx
const isEditable = editor?.isEditable;
```

### 비어있는지 확인

```tsx
const isEmpty = editor?.isEmpty;
```

## 실전 예제

### 자동 저장 기능

```tsx
import { useState, useEffect } from 'react';
import { WhiteEditor } from '@0ffen/white-editor';
import type { Editor, JSONContent } from '@0ffen/white-editor';

function AutoSaveEditor() {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [content, setContent] = useState<JSONContent | null>(null);

  useEffect(() => {
    if (!content) return;

    const timer = setTimeout(() => {
      fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify({ content }),
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('자동 저장됨');
    }, 2000);

    return () => clearTimeout(timer);
  }, [content]);

  return <WhiteEditor onCreate={setEditor} onChange={setContent} />;
}
```

### 템플릿 삽입 기능

```tsx
function TemplateEditor() {
  const [editor, setEditor] = useState<Editor | null>(null);

  const templates = {
    meeting: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: '회의록' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '참석자' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '안건' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '' }] },
      ],
    },
    report: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: '보고서' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '요약' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '상세 내용' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '' }] },
      ],
    },
  };

  const insertTemplate = (type: 'meeting' | 'report') => {
    editor?.commands.setContent(templates[type]);
  };

  return (
    <div>
      <div className='mb-4 flex gap-2'>
        <button onClick={() => insertTemplate('meeting')}>회의록 템플릿</button>
        <button onClick={() => insertTemplate('report')}>보고서 템플릿</button>
      </div>
      <WhiteEditor onCreate={setEditor} />
    </div>
  );
}
```

### 글자수 실시간 표시

```tsx
function CharacterCountEditor() {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [charCount, setCharCount] = useState(0);

  const updateCharCount = () => {
    if (editor) {
      const count = editor.storage.characterCount?.characters() || 0;
      setCharCount(count);
    }
  };

  return (
    <div>
      <div className='mb-2'>글자수: {charCount}</div>
      <WhiteEditor onCreate={setEditor} onUpdate={updateCharCount} />
    </div>
  );
}
```

## 다음 단계

- [유틸리티](/guide/utilities) - 유틸리티 함수를 사용합니다.
- [API 레퍼런스](/api/editor-props) - 모든 Props를 확인합니다.
- [Types API](/api/types) - 타입 정의를 확인합니다.
