type EditorColor = (typeof EDITOR_COLORS)[number];

const TRANSPARENT_COLOR = '#ffffff00';

const EDITOR_COLORS = [
  {
    label: 'Black',
    value: 'var(--we-color-text-black)',
    hex: '#000000',
    border: 'var(--we-color-text-black-contrast)',
  },
  {
    label: 'White',
    value: 'var(--we-color-text-white)',
    hex: '#ffffff',
    border: 'var(--we-border)',
  },
  {
    label: 'Gray',
    value: 'var(--we-color-text-gray)',
    hex: '#9C9C9C',
    border: 'var(--we-color-text-gray-contrast)',
  },
  {
    label: 'Yellow',
    value: 'var(--we-color-text-yellow)',
    hex: '#FFDB3D',
    border: 'var(--we-color-text-yellow-contrast)',
  },
  {
    label: 'Green',
    value: 'var(--we-color-text-green)',
    hex: '#18D25A',
    border: 'var(--we-color-text-green-contrast)',
  },
  {
    label: 'Blue',
    value: 'var(--we-color-text-blue)',
    hex: '#427EFF',
    border: 'var(--we-color-text-blue-contrast)',
  },
  {
    label: 'Purple',
    value: 'var(--we-color-text-purple)',
    hex: '#AB57FF',
    border: 'var(--we-color-text-purple-contrast)',
  },
  {
    label: 'Red',
    value: 'var(--we-color-text-red)',
    hex: '#FF5452',
    border: 'var(--we-color-text-red-contrast)',
  },
];

const EDITOR_COLORS_MAP = EDITOR_COLORS.map((color) => color.value);

export { EDITOR_COLORS, EDITOR_COLORS_MAP, type EditorColor, TRANSPARENT_COLOR };
