'use client';
/**
 * Base64 Data URL을 Blob 객체로 변환합니다.
 * 서버사이드에서는 에러를 throw합니다.
 *
 * @param dataUrl - 변환할 Base64 Data URL (예: 'data:image/png;base64,iVBORw0KG...')
 * @returns 변환된 Blob 객체
 * @throws {Error} 서버사이드에서 호출하거나 잘못된 형식의 Data URL인 경우
 * @example
 * ```ts
 * const blob = base64ToBlob('data:image/png;base64,iVBORw0KG...');
 * // Returns: Blob { type: 'image/png', size: ... }
 * ```
 */
export function base64ToBlob(dataUrl: string): Blob {
  if (typeof window === 'undefined') {
    throw new Error('base64ToBlob can only be used in the browser');
  }

  const [meta, base64Data] = dataUrl.split(',');
  if (!meta || !base64Data) throw new Error('Invalid base64 data URL');

  // MIME 타입 추출
  const mimeMatch = meta.match(/:(.*?);/);
  if (!mimeMatch) throw new Error('Invalid MIME type in data URL');
  const mime = mimeMatch[1];

  // base64 → binary
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const u8arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    u8arr[i] = binaryString.charCodeAt(i);
  }

  return new Blob([u8arr], { type: mime });
}
