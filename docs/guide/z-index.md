# Z-Index 설정

에디터 내부 오버레이·드롭다운·툴바 등이 사용하는 z-index를 프로젝트에서 조절해 다른 UI와 겹치지 않도록 할 수 있습니다.

## CSS 변수와 테마 유틸리티

z-index는 **CSS 변수**(`--we-z-index-*`)로 정의되어 있으며, Tailwind 테마를 통해 **유틸리티 클래스**로 참조됩니다.

| CSS 변수 | Tailwind 유틸리티 | 기본값 | 용도 |
|----------|-------------------|--------|------|
| `--we-z-index-toolbar` | `we:z-toolbar` | 10 | 툴바 영역, 툴바 내부 그룹 |
| `--we-z-index-inline` | `we:z-inline` | 10 | 멘션 리스트, 스티키 헤더, 토글 포커스 링 |
| `--we-z-index-handle` | — | 20 | 테이블 열 리사이즈 핸들 (CSS 전용) |
| `--we-z-index-overlay` | `we:z-overlay` | 50 | 다이얼로그 배경(오버레이) |
| `--we-z-index-floating` | `we:z-floating` | 50 | 드롭다운, 팝오버, 툴팁, 셀렉트, 컨텍스트 메뉴, 다이얼로그 콘텐츠 |

## 사용처 목록

| 구분 | 위치 | 용도 |
|------|------|------|
| CSS | `editor.css` | 테이블 열 리사이즈 핸들, 멘션 리스트 섹션 헤더 |
| Tailwind | `toolbar.tsx` | 툴바(fixed/floating) |
| Tailwind | `dialog.tsx` | 다이얼로그 오버레이, 다이얼로그 콘텐츠 |
| Tailwind | `tooltip.tsx` | 툴팁 |
| Tailwind | `popover.tsx` | 팝오버 |
| Tailwind | `dropdown-menu.tsx` | 드롭다운 메뉴 |
| Tailwind | `context-menu.tsx` | 컨텍스트 메뉴 |
| Tailwind | `select.tsx` | 셀렉트 콘텐츠 |
| Tailwind | `unified-mention-list.tsx`, `mention-list.tsx` | 멘션 리스트 |
| Tailwind | `toggle-group.tsx` | 포커스 링 |

## 프로젝트에서 z-index 조절하기

다른 레이어(헤더, 사이드바, 모달 등)와 겹치지 않도록 **`:root` 또는 `body`** 에서 CSS 변수를 오버라이드하세요.

```css
:root {
  --we-z-index-toolbar: 100;
  --we-z-index-inline: 100;
  --we-z-index-handle: 110;
  --we-z-index-overlay: 9999;
  --we-z-index-floating: 10000;
}
```

> **참고:** 다이얼로그, 드롭다운, 툴팁 등은 Radix Portal로 `document.body`에 렌더됩니다. 따라서 이 요소들의 z-index는 **`:root`(또는 `body`)에 설정한 CSS 변수를 상속**합니다. 에디터를 감싼 wrapper에만 변수를 넣으면 포탈 UI에는 적용되지 않습니다. 다른 전역 UI와의 겹침을 피하려면 `:root`에 설정하는 것을 권장합니다.

## 예시

- 전역 모달이 10000을 쓰는 경우, 에디터 플로팅 UI를 더 위에 두려면:
  ```css
  :root {
    --we-z-index-overlay: 10001;
    --we-z-index-floating: 10002;
  }
  ```
- 에디터를 iframe이나 별도 레이어에서만 쓰고, 메인 앱 z-index와 완전히 분리하고 싶다면 해당 컨테이너의 루트에 위 변수들을 설정하면 됩니다.
