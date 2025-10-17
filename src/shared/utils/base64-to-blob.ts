/**
 * Base64 Data URL을 Blob으로 변환
 * @param dataUrl base64 Data URL
 * @returns Blob
 */
export function base64ToBlob(dataUrl: string): Blob {
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
