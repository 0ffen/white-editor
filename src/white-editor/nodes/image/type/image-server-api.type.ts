/**
 * 이미지 서버 업로드/다운로드를 위한 API 인터페이스
 */
export interface ImageUploadResponse {
  success: boolean;
  url: string;
  id?: string;
  metadata?: {
    filename: string;
    size: number;
    mimeType: string;
    width?: number;
    height?: number;
  };
}

export interface ImageServerAPI {
  upload: (
    file: File, // 업로드할 이미지 파일
    onProgress?: (progress: number) => void, // 업로드 진행률 콜백
    abortSignal?: AbortSignal // 업로드 취소용 signal
  ) => Promise<ImageUploadResponse>;
  download?: (url: string) => Promise<Blob>; // 이미지 다운로드 param: 업로드 된 이미지 URL
  delete?: (id: string) => Promise<boolean>; // 이미지 삭제
}
