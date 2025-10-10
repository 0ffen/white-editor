import { type Editor } from '@tiptap/react';

type HighlightColor = (typeof HIGHLIGHT_COLORS)[number];

interface ColorValue {
  label: string;
  value: string;
  border: string;
}

interface UseColorHighlightConfig {
  editor?: Editor | null;
  highlightColor?: ColorValue;
  label?: string;
  hideWhenUnavailable?: boolean;
  onApplied?: ({ color, label }: { color: string; label: string }) => void;
}

const COLOR_HIGHLIGHT_SHORTCUT_KEY = 'mod+shift+h';

const HIGHLIGHT_COLORS = [
  {
    label: 'Yellow background',
    value: 'var(--we-color-highlight-yellow)',
    border: 'var(--we-color-highlight-yellow-contrast)',
  },
  {
    label: 'Green background',
    value: 'var(--we-color-highlight-green)',
    border: 'var(--we-color-highlight-green-contrast)',
  },
  {
    label: 'Blue background',
    value: 'var(--we-color-highlight-blue)',
    border: 'var(--we-color-highlight-blue-contrast)',
  },
  {
    label: 'Purple background',
    value: 'var(--we-color-highlight-purple)',
    border: 'var(--we-color-highlight-purple-contrast)',
  },
  {
    label: 'Red background',
    value: 'var(--we-color-highlight-red)',
    border: 'var(--we-color-highlight-red-contrast)',
  },
];

const HIGHLIGHT_COLORS_MAP = HIGHLIGHT_COLORS.map((color) => color.value);

export type { HighlightColor, UseColorHighlightConfig, ColorValue };
export { COLOR_HIGHLIGHT_SHORTCUT_KEY, HIGHLIGHT_COLORS, HIGHLIGHT_COLORS_MAP };
