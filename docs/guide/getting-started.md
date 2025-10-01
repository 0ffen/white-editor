# 설치 및 시작

White Editor를 프로젝트에 설치하고 시작하는 방법을 안내합니다.

## 설치

White Editor는 GitHub Package Registry를 통해 배포됩니다.

### NPM 레지스트리 설정

먼저 `@0ffen` 스코프에 대한 레지스트리를 설정합니다.

```bash
npm config set @0ffen:registry=https://npm.pkg.github.com
```

### 패키지 설치

```bash
pnpm install @0ffen/white-editor
```

```bash
npm install @0ffen/white-editor
```

```bash
yarn add @0ffen/white-editor
```

## 빠른 시작

### React 프로젝트

```tsx
import { WhiteEditor } from '@0ffen/white-editor';

function App() {
  return <WhiteEditor />;
}
```

### Next.js 프로젝트

Next.js에서는 SSR을 비활성화하기 위해 동적 임포트를 사용해야 합니다.

```tsx
'use client';

import dynamic from 'next/dynamic';

const WhiteEditor = dynamic(() => import('@0ffen/white-editor').then((mod) => ({ default: mod.WhiteEditor })), {
  ssr: false,
});

export default function Home() {
  return <WhiteEditor />;
}
```

## 기본 예제

콘텐츠 변경을 추적하는 기본 예제입니다.

```tsx
import { useState } from 'react';
import { WhiteEditor, createEmptyContent } from '@0ffen/white-editor';
import type { JSONContent } from '@0ffen/white-editor';

function App() {
  const [content, setContent] = useState<JSONContent>(createEmptyContent());

  return (
    <WhiteEditor
      onChange={(content) => {
        setContent(content);
        console.log('Content changed:', content);
      }}
    />
  );
}
```

## 다음 단계

- [기본 사용법](/guide/usage) - 에디터의 기본 사용법을 배웁니다.
- [툴바 커스터마이징](/guide/toolbar) - 툴바를 원하는 대로 설정합니다.
- [API 레퍼런스](/api/editor-props) - 모든 Props를 확인합니다.
