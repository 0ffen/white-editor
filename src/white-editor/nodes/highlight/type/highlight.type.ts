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
    label: 'Blue background',
    value: 'var(--we-color-highlight-blue)',
    border: 'var(--we-color-highlight-blue-border)',
  },
  {
    label: 'Green background',
    value: 'var(--we-green-weak)',
    border: 'var(--we-green-light)',
  },
  {
    label: 'Red background',
    value: 'var(--we-red-weak)',
    border: 'var(--we-red-light)',
  },
  {
    label: 'Purple background',
    value: 'var(--we-purple-weak)',
    border: 'var(--we-purple-light)',
  },
  {
    label: 'Yellow background',
    value: 'var(--we-yellow-weak)',
    border: 'var(--we-yellow-light)',
  },
];

const HIGHLIGHT_COLORS_MAP = HIGHLIGHT_COLORS.map((color) => color.value);

export type { HighlightColor, UseColorHighlightConfig, ColorValue };
export { COLOR_HIGHLIGHT_SHORTCUT_KEY, HIGHLIGHT_COLORS, HIGHLIGHT_COLORS_MAP };
