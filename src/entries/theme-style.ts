'use client';

/**
 * ThemeStyle 전용 진입점.
 * import { WhiteEditorThemeStyle } from '@0ffen/white-editor/theme-style'
 *
 * viewer entry와 분리하여 tiptap/katex/hljs 의존 없이 테마만 적용.
 */
import '@/shared/styles/index.css';

export { WhiteEditorThemeStyle } from '@/white-editor/theme-style/white-editor-theme-style';
