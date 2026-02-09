/**
 * src URL에서 파일명 추출
 */
export function getFilenameFromSrc(src: string | null): string {
  if (!src) return '';
  try {
    const path = new URL(src, 'https://_').pathname;
    return path.split('/').pop() || '';
  } catch {
    return src;
  }
}

function ensureExtension(name: string, ext: string): string {
  return /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(name) ? name : `${name.replace(/\.[^/.]+$/, '')}.${ext}`;
}

/**
 * 이미지 URL을 브라우저에서 파일로 다운로드합니다.
 * CORS 등으로 fetch가 실패하면 새 탭에서 열립니다.
 */
export async function downloadImage(src: string): Promise<void> {
  const filename = getFilenameFromSrc(src) || 'image';

  try {
    if (src.startsWith('data:')) {
      const res = await fetch(src);
      const blob = await res.blob();
      const ext = blob.type.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = ensureExtension(filename, ext);
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    const res = await fetch(src, { mode: 'cors' });
    const blob = await res.blob();
    const ext = blob.type.split('/')[1]?.replace('jpeg', 'jpg') || filename.split('.').pop() || 'png';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = ensureExtension(filename, ext);
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    window.open(src, '_blank');
  }
}
