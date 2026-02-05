import { TEXT_COLORS } from '../type/color.type';

type TextColorItem = (typeof TEXT_COLORS)[number];

/**
 * 팔레트에 사용하는 CSS 변수 → hex 맵 (light 테마 기준).
 * 복붙 시 hex/rgb로 들어온 색상을 팔레트와 비교할 때 사용합니다.
 */
const TEXT_COLOR_VAR_TO_HEX: Record<string, string> = {
  'var(--we-text-normal)': '#161616',
  'var(--we-text-light)': '#9f9f9f',
  'var(--we-red-default)': '#f73b3b',
  'var(--we-yellow-default)': '#ffbe18',
  'var(--we-green-default)': '#17b530',
  'var( --we-color-text-blue)': '#3279ec',
  'var(--we-color-text-blue)': '#3279ec',
  'var(--we-purple-default)': '#a855f7',
  'var(--we-pink-default)': '#ec4899',
};

/**
 * rgb(r, g, b) 또는 rgba(...) 문자열을 #rrggbb hex로 변환
 */
function parseRgbToHex(color: string): string | null {
  const rgb = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!rgb) return null;
  const r = parseInt(rgb[1], 10);
  const g = parseInt(rgb[2], 10);
  const b = parseInt(rgb[3], 10);
  return '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('');
}

/**
 * hex 문자열 정규화 (#abc → #aabbcc, 소문자)
 */
function normalizeHex(hex: string): string {
  const cleaned = hex.replace(/^#/, '').toLowerCase();
  if (cleaned.length === 3) {
    return (
      '#' +
      cleaned
        .split('')
        .map((c) => c + c)
        .join('')
    );
  }
  return cleaned.length === 6 ? '#' + cleaned : hex;
}

/**
 * 임의의 색상 문자열(color attribute 값)을 비교 가능한 hex로 변환합니다.
 * - var(--we-*) → 팔레트 맵에서 hex 반환
 * - #hex, rgb(), rgba() → hex 반환
 * - 그 외(빈 문자열 등) → 빈 문자열
 */
export function resolveTextColorToHex(color: string): string {
  if (!color || typeof color !== 'string') return '';
  const trimmed = color.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('#')) return normalizeHex(trimmed);
  if (trimmed.startsWith('rgb')) {
    const hex = parseRgbToHex(trimmed);
    return hex ? normalizeHex(hex) : '';
  }
  const hex = TEXT_COLOR_VAR_TO_HEX[trimmed];
  return hex ? normalizeHex(hex) : '';
}

/**
 * 현재 에디터의 textStyle color(또는 임의의 색상 문자열)가
 * 팔레트 중 어떤 항목과 같은 색인지 찾습니다.
 * 복붙으로 hex/rgb가 들어와도 팔레트와 매칭해 올바른 swatch를 강조할 수 있습니다.
 */
export function matchTextColorToPalette(
  color: string,
  textColors: TextColorItem[] = TEXT_COLORS
): TextColorItem | undefined {
  const resolved = resolveTextColorToHex(color);
  if (!resolved) return undefined;
  const resolvedLower = resolved.toLowerCase();
  for (const c of textColors) {
    const paletteHex = TEXT_COLOR_VAR_TO_HEX[c.value] ?? resolveTextColorToHex(c.value);
    if (paletteHex && paletteHex.toLowerCase() === resolvedLower) return c;
  }
  return undefined;
}

/**
 * 표시용 색상: 팔레트에 매칭되면 해당 팔레트 value(CSS var)를, 아니면 원본을 그대로 반환.
 * ColorPickerButton 배경 등에서 "항상 보이는 색"을 위해 사용합니다.
 */
export function getDisplayTextColor(color: string, textColors: TextColorItem[] = TEXT_COLORS): string {
  if (!color || typeof color !== 'string') return '';
  const matched = matchTextColorToPalette(color, textColors);
  return matched ? matched.value : color;
}
