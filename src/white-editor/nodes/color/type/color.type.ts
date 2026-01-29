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
    label: 'Default',
    value: 'var(--we-text-normal)',
    border: 'var(--we-text-normal)',
  },
  {
    label: 'Gray',
    value: 'var(--we-text-light)',
    border: 'var(--we-text-light)',
  },
  {
    label: 'Red',
    value: 'var(--we-red-default)',
    border: 'var(--we-red-default)',
  },
  {
    label: 'Yellow',
    value: 'var(--we-yellow-default)',
    border: 'var(--we-yellow-default)',
  },
  {
    label: 'Green',
    value: 'var(--we-green-default)',
    border: 'var(--we-green-default)',
  },
  {
    label: 'Blue',
    value: 'var(--we-brand-default)',
    border: 'var(--we-brand-default)',
  },
  {
    label: 'Purple',
    value: 'var(--we-purple-default)',
    border: 'var(--we-purple-default)',
  },
  {
    label: 'Pink',
    value: 'var(--we-pink-default)',
    border: 'var(--we-pink-default)',
  },
];

const TEXT_COLORS_MAP = TEXT_COLORS.map((color) => color.value);

export type { TextColor, UseTextColorConfig };
export { TEXT_COLORS, TEXT_COLORS_MAP };
