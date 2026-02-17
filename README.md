# White Editor

## Guide & Playground : https://subin-enki.github.io/play-white 


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

