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
 * 원격 이미지 URL을 CORS 모드로 받아 동일 출처 blob: URL로 변환한다.
 *
 * 표시용 <img>는 crossorigin 없이(no-cors) 로드되어 브라우저가 opaque 응답을 HTTP 캐시에
 * 저장하는데, 같은 URL을 cors(crossOrigin/fetch)로 재요청하면 이 opaque 캐시를 재사용하려다
 * "No 'Access-Control-Allow-Origin'" CORS 에러가 난다. `cache: 'reload'`로 HTTP 캐시를 우회해
 * 항상 새 cors 응답을 받고, canvas taint가 없는 blob: URL로 바꿔 편집/복사/다운로드에서 쓴다.
 * data:/blob: URL은 이미 로컬이라 그대로 반환한다. 호출부는 반환값이 원본과 다르면
 * (= 새 blob이 생성됨) 사용 후 URL.revokeObjectURL로 해제해야 한다.
 */
export async function toCorsSafeBlobUrl(src: string): Promise<string> {
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) return src;
  const res = await fetch(src, { mode: 'cors', cache: 'reload' });
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

/**
 * execCommand fallback으로 이미지를 클립보드에 복사합니다.
 * HTTP(비보안 컨텍스트)에서 Clipboard API를 사용할 수 없을 때 사용됩니다.
 */
function copyImageViaExecCommand(dataUrl: string): boolean {
  const container = document.createElement('div');
  container.contentEditable = 'true';
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.opacity = '0';

  const imgEl = document.createElement('img');
  imgEl.src = dataUrl;
  container.appendChild(imgEl);
  document.body.appendChild(container);

  const range = document.createRange();
  range.selectNode(container);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);

  const success = document.execCommand('copy');
  document.body.removeChild(container);
  sel?.removeAllRanges();
  return success;
}

/**
 * 이미지 URL을 클립보드에 복사합니다.
 * PNG blob으로 변환하여 Clipboard API로 복사합니다.
 * CORS 등으로 실패하면 false를 반환합니다.
 * HTTP 환경에서는 execCommand fallback을 사용합니다.
 */
export async function copyImage(src: string): Promise<boolean> {
  let objectUrl: string | null = null;
  try {
    if (typeof window === 'undefined') return false;

    // 표시 <img>의 no-cors opaque 캐시와 충돌하지 않도록 캐시를 우회해 blob: URL로 로드한다.
    // blob: URL은 동일 출처라 canvas가 taint되지 않아 toBlob/toDataURL이 정상 동작한다.
    const loadUrl = await toCorsSafeBlobUrl(src);
    if (loadUrl !== src) objectUrl = loadUrl;

    const img = new Image();
    const loaded = await new Promise<HTMLImageElement>((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = loadUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = loaded.naturalWidth;
    canvas.height = loaded.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    ctx.drawImage(loaded, 0, 0);

    if (navigator.clipboard?.write) {
      try {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (blob) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          return true;
        }
      } catch {
        // Clipboard API 실패 시 execCommand fallback으로 전환
      }
    }

    return copyImageViaExecCommand(canvas.toDataURL('image/png'));
  } catch {
    return false;
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
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
    // cache: 'reload'로 표시 <img>의 no-cors opaque 캐시를 우회 (섞인 모드로 인한 CORS 실패 방지)
    const res = await fetch(src, { mode: 'cors', cache: 'reload' });
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
