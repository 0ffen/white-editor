export interface FileItem {
  id: string;
  file: File; //실제 업로드되는 파일 객체
  progress: number; //업로드 진행률 (0-100)
  status: 'uploading' | 'success' | 'error'; //업로드 상태
  url?: string; //업로드된 파일의 URL
  abortController?: AbortController; //업로드 취소용 AbortController
}

export interface UploadOptions {
  maxSize: number; //허용할 최대 파일 크기 (바이트 단위)
  limit: number; //허용할 최대 파일 개수
  accept: string; //허용할 파일 타입 (MIME 타입 또는 확장자)
  /**
   * 실제 파일 업로드를 처리하는 함수
   * @param {File} file - 업로드할 파일 객체
   * @param {Function} onProgress - 업로드 진행 상황을 알리는 콜백 함수
   * @param {AbortSignal} signal - 업로드를 중단할 수 있는 신호 객체
   * @returns {Promise<string>} 업로드된 파일의 URL을 반환하는 Promise
   */
  upload: (file: File, onProgress: (event: { progress: number }) => void, signal: AbortSignal) => Promise<string>;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}
