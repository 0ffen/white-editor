type EditorColor = (typeof EDITOR_COLORS)[number];

const TRANSPARENT_COLOR = '#ffffff00';

/** editor-toolbar text color와 동일한 색상 (TEXT_COLORS). editorHex는 캔버스(TUI Image Editor) API용 실제 hex 값 */
const EDITOR_COLORS = [
  {
    label: 'Default',
    value: '#161616',
    hex: '#161616',
    editorHex: '#161616',
    border: '#9f9f9f',
  },
  {
    label: 'Gray',
    value: '#9f9f9f',
    hex: '#9f9f9f',
    editorHex: '#9f9f9f',
    border: '#9f9f9f',
  },
  {
    label: 'Red',
    value: '#f73b3b',
    hex: '#f73b3b',
    editorHex: '#f73b3b',
    border: '#f73b3b',
  },
  {
    label: 'Yellow',
    value: '#ffbe18',
    hex: '#ffbe18',
    editorHex: '#ffbe18',
    border: '#ffbe18',
  },
  {
    label: 'Green',
    value: '#17b530',
    hex: '#17b530',
    editorHex: '#17b530',
    border: '#17b530',
  },
  {
    label: 'Blue',
    value: '#3279ec',
    hex: '#3279ec',
    editorHex: '#3279ec',
    border: '#3279ec',
  },
  {
    label: 'Purple',
    value: '#a855f7',
    hex: '#a855f7',
    editorHex: '#a855f7',
    border: '#a855f7',
  },
  {
    label: 'Pink',
    value: '#ec4899',
    hex: '#ec4899',
    editorHex: '#ec4899',
    border: '#ec4899',
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
