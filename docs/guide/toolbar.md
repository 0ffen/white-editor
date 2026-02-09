# 툴바 커스터마이징

White Editor의 툴바를 원하는 대로 설정하는 방법을 안내합니다.

## 기본 툴바

기본 툴바 프리셋은 패키지에서 import 해서 사용할 수 있습니다.

```tsx
import {
  WHITE_EDITOR_TOOLBAR_ITEMS,
  DEFAULT_TOOLBAR_ITEMS,
  MINIMAL_TOOLBAR_ITEMS,
  type ToolbarItem,
} from '@0ffen/white-editor';

// 전체 툴바 (White Editor 기본 구성)
toolbarItems={WHITE_EDITOR_TOOLBAR_ITEMS}

// 기본 프리셋
toolbarItems={DEFAULT_TOOLBAR_ITEMS}

// 최소 프리셋
toolbarItems={MINIMAL_TOOLBAR_ITEMS}
```

## 커스텀 툴바

### 기본 설정

이중 배열로 버튼을 그룹화합니다.

```tsx
<WhiteEditor
  toolbarItems={[
    ['undo', 'redo'],
    ['heading', 'bold', 'italic', 'color'],
    ['link', 'image'],
  ]}
/>
```

### 최소 구성

```tsx
<WhiteEditor toolbarItems={[['bold', 'italic', 'underline']]} />
```

## 사용 가능한 툴바 아이템

### 실행 취소/다시 실행

- `undo` - 실행 취소
- `redo` - 다시 실행

### 텍스트 스타일

- `heading` - 제목 (드롭다운)
- `bold` - 굵게
- `italic` - 기울임
- `underline` - 밑줄
- `strike` - 취소선
- `code` - 인라인 코드

### 텍스트 색상

- `color` - 텍스트 색상
- `highlight` - 형광펜

### 정렬

- `textAlignLeft` - 왼쪽 정렬
- `textAlignCenter` - 가운데 정렬
- `textAlignRight` - 오른쪽 정렬
- `textAlignJustify` - 양쪽 정렬

### 목록

- `bulletList` - 글머리 기호 목록
- `orderedList` - 번호 매기기 목록
- `taskList` - 체크리스트

### 블록

- `blockquote` - 인용문
- `codeblock` - 코드 블록

### 삽입

- `link` - 링크
- `table` - 테이블
- `image` - 이미지

### 수식

- `inlineMath` - 인라인 수식
- `blockMath` - 블록 수식

## 툴바 Props 커스터마이징

각 툴바 아이템의 동작과 스타일을 커스터마이징할 수 있습니다.

### Heading 옵션 설정

```tsx
<WhiteEditor
  toolbarItems={[['heading']]}
  toolbarProps={{
    heading: {
      options: [
        { label: '본문', level: null },
        { label: '제목 1', level: 1 },
        { label: '제목 2', level: 2 },
        { label: '제목 3', level: 3 },
      ],
      triggerClassName: 'w-24',
      contentClassName: 'min-w-32',
    },
  }}
/>
```

### 버튼 스타일 커스터마이징

```tsx
<WhiteEditor
  toolbarItems={[['bold', 'italic']]}
  toolbarProps={{
    bold: {
      className: 'bg-blue-500 text-white',
    },
    italic: {
      className: 'bg-green-500 text-white',
    },
  }}
/>
```

## 실전 예제

### 블로그 에디터

```tsx
<WhiteEditor
  toolbarItems={[
    ['undo', 'redo'],
    ['heading'],
    ['bold', 'italic', 'underline', 'strike'],
    ['color', 'highlight'],
    ['bulletList', 'orderedList'],
    ['link', 'image'],
    ['blockquote', 'codeblock'],
  ]}
/>
```

### 간단한 노트

```tsx
<WhiteEditor
  toolbarItems={[
    ['undo', 'redo'],
    ['bold', 'italic', 'underline'],
    ['bulletList', 'orderedList'],
  ]}
/>
```

### 기술 문서 에디터

```tsx
<WhiteEditor
  toolbarItems={[
    ['undo', 'redo'],
    ['heading'],
    ['bold', 'italic', 'code'],
    ['bulletList', 'orderedList', 'taskList'],
    ['link', 'image', 'table'],
    ['codeblock', 'inlineMath', 'blockMath'],
  ]}
/>
```

## 다음 단계

- [확장 기능](/guide/extensions) - 멘션, 글자수 제한을 설정합니다.
- [이미지 업로드](/guide/image-upload) - 이미지 업로드를 구성합니다.
- [API 레퍼런스](/api/editor-props) - 모든 Props를 확인합니다.
