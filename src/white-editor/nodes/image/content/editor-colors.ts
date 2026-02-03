type EditorColor = (typeof EDITOR_COLORS)[number];

const TRANSPARENT_COLOR = '#ffffff00';

/** editor-toolbar text color와 동일한 색상 (TEXT_COLORS). editorHex는 캔버스(TUI Image Editor) API용 실제 hex 값 */
const EDITOR_COLORS = [
  {
    label: 'Default',
    value: 'var(--we-text-normal)',
    hex: 'var(--we-text-normal)',
    editorHex: '#161616',
    border: 'var(--we-text-normal)',
  },
  {
    label: 'Gray',
    value: 'var(--we-text-light)',
    hex: 'var(--we-text-light)',
    editorHex: '#9f9f9f',
    border: 'var(--we-text-light)',
  },
  {
    label: 'Red',
    value: 'var(--we-red-default)',
    hex: 'var(--we-red-default)',
    editorHex: '#f73b3b',
    border: 'var(--we-red-default)',
  },
  {
    label: 'Yellow',
    value: 'var(--we-yellow-default)',
    hex: 'var(--we-yellow-default)',
    editorHex: '#ffbe18',
    border: 'var(--we-yellow-default)',
  },
  {
    label: 'Green',
    value: 'var(--we-green-default)',
    hex: 'var(--we-green-default)',
    editorHex: '#17b530',
    border: 'var(--we-green-default)',
  },
  {
    label: 'Blue',
    value: 'var(--we-brand-default)',
    hex: 'var(--we-brand-default)',
    editorHex: '#3279ec',
    border: 'var(--we-brand-default)',
  },
  {
    label: 'Purple',
    value: 'var(--we-purple-default)',
    hex: 'var(--we-purple-default)',
    editorHex: '#a855f7',
    border: 'var(--we-purple-default)',
  },
  {
    label: 'Pink',
    value: 'var(--we-pink-default)',
    hex: 'var(--we-pink-default)',
    editorHex: '#ec4899',
    border: 'var(--we-pink-default)',
  },
];

const EDITOR_COLORS_MAP = EDITOR_COLORS.map((color) => color.value);

/** 캔버스(TUI Image Editor) API에 넘길 때 사용. rgb() 또는 hex를 hex 문자열로 통일 */
function normalizeCanvasColor(fill: string): string {
  if (!fill || fill.startsWith('#')) return fill || EDITOR_COLORS[0].editorHex;
  const rgb = fill.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!rgb) return fill;
  const r = parseInt(rgb[1], 10);
  const g = parseInt(rgb[2], 10);
  const b = parseInt(rgb[3], 10);
  return '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('');
}

export { EDITOR_COLORS, EDITOR_COLORS_MAP, normalizeCanvasColor, type EditorColor, TRANSPARENT_COLOR };
