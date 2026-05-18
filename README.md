# White Editor

## Guide & Playground : [https://subin-enki.github.io/play-white](https://subin-enki.github.io/play-white)

## Stack

Core

- **TipTap** - Rich text editor framework
- **TUI Image Editor** - Image editing library
- **React**
- **TypeScript**
- **Vite**
- **TailwindCSS, Shadcn UI** - Styling
- **Lucide React** - Icon

## 설치

```bash
# 1) GitHub Packages registry 등록 (최초 1회)
npm config set @0ffen:registry=https://npm.pkg.github.com

# 2) 라이브러리 + peer deps 설치
pnpm install @0ffen/white-editor
pnpm install react react-dom @tiptap/core @tiptap/pm @tiptap/react i18next
```

> `pnpm v8+` / `npm v7+` 는 `auto-install-peers`가 기본 활성이라 두 번째 명령은 생략 가능. `yarn classic (v1)` 에서만 명시 설치 필요.

## 기본 사용

```ts
// 컨슈머 entry (main.tsx, _app.tsx, root layout 등)
import '@0ffen/white-editor/style.css';            // 필수 — 라이브러리 UI 스타일

// 폰트는 모두 선택 (필요한 것만 import)
import '@0ffen/white-editor/codeblock.css';        // D2Coding 코드블록 폰트 (~3MB)
import '@0ffen/white-editor/pretendard.css';       // Pretendard Variable 본문 폰트 (~2MB)
import '@0ffen/white-editor/katex.css';            // KaTeX 수식 폰트 (수식 사용 시)

import { WhiteEditor } from '@0ffen/white-editor';
```

폰트 import를 생략하면 본문은 시스템 폰트(`-apple-system`, `Segoe UI` 등) fallback으로, 코드블록은 `Menlo` / `Consolas` 등으로 표시됩니다.

라이브러리 UI 전역 폰트를 다른 폰트로 바꾸려면 CSS 변수 한 줄로 가능합니다:

```css
.white-editor { --we-font-family-base: 'Interop', sans-serif; }
```

자세한 폰트 정책과 JS API(`applyTheme`)는 아래 [폰트 정책](#폰트-정책) 섹션 참고.

## 진입점 (Entry points)

| Subpath | 용도 | 필수 |
|---|---|---|
| `@0ffen/white-editor` | 에디터·뷰어·테마·타입·확장·툴바 프리셋 (메인) | ✓ |
| `@0ffen/white-editor/editor` | 에디터 전용 | 선택 |
| `@0ffen/white-editor/viewer` | 뷰어 전용 | 선택 |
| `@0ffen/white-editor/util` | 유틸 함수만 (`getHtmlContent`, `createEmptyContent`, `checkEditorEmpty`, `normalizeContentSchema` 등) | 선택 |
| `@0ffen/white-editor/style.css` | UI 스타일시트 | ✓ |
| `@0ffen/white-editor/katex.css` | KaTeX 스타일 + 폰트 | 수식 사용 시 |
| `@0ffen/white-editor/codeblock.css` | D2Coding 코드블록 모노스페이스 폰트 (~3MB) | 코드 폰트 필요 시 |
| `@0ffen/white-editor/pretendard.css` | Pretendard Variable 폰트 (~2MB) | Pretendard 직접 동봉 필요 시 |

메인 entry는 `WHITE_EDITOR_TOOLBAR_ITEMS`, `DEFAULT_TOOLBAR_ITEMS`, `MINIMAL_TOOLBAR_ITEMS` 등 툴바 프리셋도 함께 export합니다.

<details>
<summary><strong>Peer Dependencies 이유</strong></summary>

| 패키지 | 버전 | 이유 |
|---|---|---|
| `react`, `react-dom` | `^19.2.0` | React 인스턴스 / hook context 단일화 |
| `@tiptap/core`, `@tiptap/pm`, `@tiptap/react` | `^3.17.1` | Editor·ProseMirror state 인스턴스 단일화 (2 copy 시 schema/state 비교가 깨짐) |
| `i18next` | `^25.8.0` | 전역 `i18next.use()` 등록 — 2 copy 시 컨슈머 리소스 미반영 |

위 패키지를 **싱글톤 충돌 방지**를 위해 `peerDependencies`로 선언했습니다.

</details>

<details>
<summary><strong>번들 사이즈 정책 (external 처리)</strong></summary>

`v2.0` 부터 다음 패키지들은 라이브러리 `dist`에 번들되지 않고 컨슈머의 `node_modules`에서 런타임 해석됩니다 (`external` 처리):

`@tiptap/*`, `prosemirror-*`, `@radix-ui/*`, `@floating-ui/*`, `katex`, `lowlight`, `tui-image-editor`, `lucide-react`, `i18next` / `react-i18next`, `tiptap-markdown`.

이미지 편집기(`tui-image-editor`)는 `React.lazy`로 분리되어 **편집 다이얼로그 진입 시점에만** 로드됩니다 → viewer-only 컨슈머는 `tui-image-editor`를 다운로드하지 않습니다.

CSS는 별도 파일로 emit되므로 SSR/SSG FOUC가 없고, JS 청크는 그만큼 가벼워집니다. (`v2.0` 까지는 JS에 inline 자동 주입 방식)

</details>

### 폰트 정책

라이브러리는 폰트 파일을 본체 CSS에 자동 포함하지 않습니다. 컨슈머가 자유롭게 폰트를 결정할 수 있도록 다음 메커니즘을 제공합니다.

**1) 기본 동작 — 시스템 폰트 fallback**

별도 설정 없이 라이브러리를 import하면 `--we-font-family-base` 토큰의 fallback chain을 따릅니다:

```
Pretendard Variable → Pretendard → -apple-system → BlinkMacSystemFont → Segoe UI → Roboto → ... → sans-serif
```

OS나 호스트 페이지에 `Pretendard` 패밀리가 설치되어 있으면 자동으로 사용되고, 없으면 시스템 폰트로 표시됩니다.

**2) 컨슈머 폰트로 오버라이드**

CSS custom property를 재정의해서 라이브러리 UI 전체 폰트를 한 줄로 교체할 수 있습니다:

```css
/* 컨슈머 글로벌 CSS */
.white-editor {
  --we-font-family-base: 'Interop', sans-serif;
  /* 또는 호스트 페이지 폰트를 그대로 상속받고 싶다면 */
  /* --we-font-family-base: inherit; */
}
```

`!important` 없이도 cascade로 자연스럽게 적용됩니다.

JS API로도 가능합니다 (`applyTheme`의 `fontFamily` 옵션):

```ts
import { applyTheme } from '@0ffen/white-editor/util';

applyTheme({
  mode: 'light',
  fontFamily: "'Interop', sans-serif",
});
```

**3) Pretendard를 라이브러리에서 직접 받고 싶다면 (opt-in)**

```ts
// 컨슈머 entry
import '@0ffen/white-editor/style.css';
import '@0ffen/white-editor/pretendard.css'; // Pretendard woff2 @font-face 활성화
```

이 경우에만 `PretendardVariable.woff2` (~2MB)가 컨슈머 번들에 포함됩니다. import하지 않으면 폰트 파일은 다운로드되지 않습니다.

### 코드블록 폰트(D2Coding) 사용 시 (opt-in)

코드블록을 모노스페이스 폰트로 보이게 하려면 `codeblock.css`를 추가로 import합니다.

```ts
// 컨슈머 entry
import '@0ffen/white-editor/style.css';
import '@0ffen/white-editor/codeblock.css'; // D2Coding woff2 @font-face 활성화 (~3MB)
```

import하지 않으면 코드블록은 컨슈머의 시스템 모노스페이스 폰트(`Menlo`, `Consolas` 등)로 fallback됩니다.

### 수식(KaTeX) 사용 시

수식 익스텐션을 사용하면 KaTeX CSS를 별도로 import해야 폰트와 레이아웃이 정상 표시됩니다.

```ts
// 컨슈머 entry
import '@0ffen/white-editor/style.css';
import '@0ffen/white-editor/katex.css'; // 수식 사용 시에만
```

폰트는 `woff2`만 동봉되며, 컨슈머 번들러(Vite/Webpack/Turbopack)가 자동으로 폰트 경로를 처리합니다. 수식을 쓰지 않는 컨슈머는 import를 생략해 ~300KB 폰트를 받지 않을 수 있습니다.

Next.js(App Router), React 19에서 정적 import로 사용할 수 있도록 `"use client"`가 포함되어 있습니다.