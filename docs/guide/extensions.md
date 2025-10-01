# 확장 기능

White Editor의 확장 기능을 설정하는 방법을 안내합니다.

## 멘션 (Mention)

`@` 기호를 입력하면 사용자를 태그할 수 있는 멘션 기능입니다.

### 기본 사용법

```tsx
<WhiteEditor
  extension={{
    mention: {
      data: [
        { uuid: 1, name: 'White Lee', nickname: 'white' },
        { uuid: 2, name: 'Black Kim', nickname: 'black' },
        { uuid: 3, name: 'Gray Park', nickname: 'gray' },
      ],
      id: 'uuid',
      label: 'nickname',
    },
  }}
/>
```

### Props

- `data` - 멘션할 수 있는 데이터 배열
- `id` - 고유 식별자로 사용할 필드명
- `label` - 화면에 표시할 필드명

### 커스텀 데이터 구조

```tsx
interface User {
  userId: string;
  displayName: string;
  email: string;
}

const users: User[] = [
  { userId: 'user1', displayName: '홍길동', email: 'hong@example.com' },
  { userId: 'user2', displayName: '김철수', email: 'kim@example.com' },
];

<WhiteEditor
  extension={{
    mention: {
      data: users,
      id: 'userId',
      label: 'displayName',
    },
  }}
/>;
```

### 동적 데이터 로딩

```tsx
import { useState, useEffect } from 'react';

function MyEditor() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  return (
    <WhiteEditor
      extension={{
        mention: {
          data: users,
          id: 'id',
          label: 'name',
        },
      }}
    />
  );
}
```

## 글자수 제한 (Character Count)

에디터에 입력된 글자수를 표시하고 제한할 수 있습니다.

### 글자수만 표시

```tsx
<WhiteEditor
  extension={{
    character: {
      show: true,
    },
  }}
/>
```

### 글자수 제한 설정

```tsx
<WhiteEditor
  extension={{
    character: {
      show: true,
      limit: 1000,
    },
  }}
/>
```

제한을 초과하면 에디터 우측 하단에 경고 색상으로 표시됩니다.

### 스타일 커스터마이징

```tsx
<WhiteEditor
  extension={{
    character: {
      show: true,
      limit: 500,
      className: 'text-blue-600 font-bold',
    },
  }}
/>
```

## 복합 설정

여러 확장 기능을 함께 사용할 수 있습니다.

```tsx
<WhiteEditor
  extension={{
    mention: {
      data: users,
      id: 'userId',
      label: 'username',
    },
    character: {
      show: true,
      limit: 2000,
      className: 'text-gray-600',
    },
  }}
/>
```

## 실전 예제

### 소셜 미디어 게시글 에디터

```tsx
import { WhiteEditor } from '@0ffen/white-editor';

const team = [
  { id: 1, name: '김팀장', role: '팀장' },
  { id: 2, name: '이대리', role: '개발자' },
  { id: 3, name: '박사원', role: '디자이너' },
];

function PostEditor() {
  return (
    <WhiteEditor
      toolbarItems={[['bold', 'italic'], ['bulletList'], ['link', 'image']]}
      extension={{
        mention: {
          data: team,
          id: 'id',
          label: 'name',
        },
        character: {
          show: true,
          limit: 500,
        },
      }}
      contentClassName='min-h-[200px]'
    />
  );
}
```

### 댓글 작성 에디터

```tsx
function CommentEditor({ users }) {
  return (
    <WhiteEditor
      toolbarItems={[['bold', 'italic']]}
      extension={{
        mention: {
          data: users,
          id: 'username',
          label: 'username',
        },
        character: {
          show: true,
          limit: 300,
        },
      }}
      contentClassName='min-h-[100px]'
    />
  );
}
```

## 다음 단계

- [이미지 업로드](/guide/image-upload) - 이미지 업로드를 구성합니다.
- [에디터 제어](/guide/editor-control) - 에디터를 프로그래밍 방식으로 제어합니다.
- [Types API](/api/types) - 타입 정의를 확인합니다.
