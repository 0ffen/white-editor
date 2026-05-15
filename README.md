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

### Peer Dependencies

다음 패키지는 **싱글톤 충돌 방지**를 위해 `peerDependencies`로 선언되어 있습니다. 컨슈머 프로젝트에 함께 설치해야 합니다.

```bash
pnpm install react react-dom @tiptap/core @tiptap/pm @tiptap/react i18next
```

| 패키지 | 버전 | 이유 |
|---|---|---|
| `react`, `react-dom` | `^19.2.0` | React 인스턴스 / hook context 단일화 |
| `@tiptap/core`, `@tiptap/pm`, `@tiptap/react` | `^3.17.1` | Editor·ProseMirror state 인스턴스 단일화 (2 copy 시 schema/state 비교가 깨짐) |
| `i18next` | `^25.8.0` | 전역 `i18next.use()` 등록 — 2 copy 시 컨슈머 리소스 미반영 |

> **pnpm v8+ / npm v7+** 는 `auto-install-peers`가 기본 활성화되어 있어 자동으로 설치됩니다.
> **yarn classic(v1)** 사용 시에만 위 명령으로 명시 설치가 필요합니다.

### 번들 사이즈

`v2.0` 부터 다음 패키지들은 라이브러리 dist에 번들되지 않고 컨슈머의 `node_modules`에서 런타임 해석됩니다(`external` 처리):
`@tiptap/*`, `prosemirror-*`, `@radix-ui/*`, `@floating-ui/*`, `katex`, `lowlight`, `tui-image-editor`, `lucide-react`, `i18next` / `react-i18next`, `tiptap-markdown`.

이미지 편집기(`tui-image-editor`)는 `React.lazy`로 분리되어 **편집 다이얼로그 진입 시점에만** 로드됩니다 → viewer-only 컨슈머는 `tui-image-editor`를 다운로드하지 않습니다.

**진입점 (Entry points)**  
- `@0ffen/white-editor` — 에디터·뷰어·테마·타입·확장·툴바 프리셋(`WHITE_EDITOR_TOOLBAR_ITEMS`, `DEFAULT_TOOLBAR_ITEMS`, `MINIMAL_TOOLBAR_ITEMS`) (메인)
- `@0ffen/white-editor/util` — 유틸만 (`getHtmlContent`, `createEmptyContent`, `checkEditorEmpty`, `normalizeContentSchema` 등)
- `@0ffen/white-editor/editor` — 에디터 전용
- `@0ffen/white-editor/viewer` — 뷰어 전용

Next.js(App Router), React 19에서 정적 import로 사용할 수 있도록 `"use client"`가 포함되어 있습니다.

