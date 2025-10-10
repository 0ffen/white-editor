import type { ColorValue } from '@/white-editor';
import { type Editor } from '@tiptap/react';

type TextColor = (typeof TEXT_COLORS)[number];

interface UseTextColorConfig {
  editor?: Editor | null;
  textColor?: ColorValue;
  label?: string;
  hideWhenUnavailable?: boolean;
  onApplied?: ({ color, label }: { color: string; label: string }) => void;
}

const TEXT_COLORS = [
  {
    label: 'Gray background',
    value: 'var(--we-color-text-gray)',
    border: 'var(--we-color-text-gray-contrast)',
  },
  {
    label: 'Yellow background',
    value: 'var(--we-color-text-yellow)',
    border: 'var(--we-color-text-yellow-contrast)',
  },
  {
    label: 'Green background',
    value: 'var(--we-color-text-green)',
    border: 'var(--we-color-text-green-contrast)',
  },
  {
    label: 'Blue background',
    value: 'var(--we-color-text-blue)',
    border: 'var(--we-color-text-blue-contrast)',
  },
  {
    label: 'Purple background',
    value: 'var(--we-color-text-purple)',
    border: 'var(--we-color-text-purple-contrast)',
  },
  {
    label: 'Red background',
    value: 'var(--we-color-text-red)',
    border: 'var(--we-color-text-red-contrast)',
  },
];

const TEXT_COLORS_MAP = TEXT_COLORS.map((color) => color.value);

export type { TextColor, UseTextColorConfig };
export { TEXT_COLORS, TEXT_COLORS_MAP };
