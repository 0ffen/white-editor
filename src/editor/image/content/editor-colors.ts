type EditorColor = (typeof EDITOR_COLORS)[number];

const TRANSPARENT_COLOR = '#ffffff00';

const EDITOR_COLORS = [
  {
    label: 'Black',
    value: 'var(--tt-color-text-black)',
    hex: '#000000',
    border: 'var(--tt-color-text-black-contrast)',
  },
  {
    label: 'White',
    value: 'var(--tt-color-text-white)',
    hex: '#ffffff',
    border: 'var(--border)',
  },
  {
    label: 'Gray',
    value: 'var(--tt-color-text-gray)',
    hex: '#9C9C9C',
    border: 'var(--tt-color-text-gray-contrast)',
  },
  {
    label: 'Yellow',
    value: 'var(--tt-color-text-yellow)',
    hex: '#FFDB3D',
    border: 'var(--tt-color-text-yellow-contrast)',
  },
  {
    label: 'Green',
    value: 'var(--tt-color-text-green)',
    hex: '#18D25A',
    border: 'var(--tt-color-text-green-contrast)',
  },
  {
    label: 'Blue',
    value: 'var(--tt-color-text-blue)',
    hex: '#427EFF',
    border: 'var(--tt-color-text-blue-contrast)',
  },
  {
    label: 'Purple',
    value: 'var(--tt-color-text-purple)',
    hex: '#AB57FF',
    border: 'var(--tt-color-text-purple-contrast)',
  },
  {
    label: 'Red',
    value: 'var(--tt-color-text-red)',
    hex: '#FF5452',
    border: 'var(--tt-color-text-red-contrast)',
  },
];

const EDITOR_COLORS_MAP = EDITOR_COLORS.map((color) => color.value);

export { EDITOR_COLORS, EDITOR_COLORS_MAP, type EditorColor, TRANSPARENT_COLOR };
