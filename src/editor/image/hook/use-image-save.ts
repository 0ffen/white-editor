import { useCallback } from 'react';
import type { ImageServerAPI } from '@/editor';
import { handleImageUpload } from '@/shared/utils';
import type { Editor } from '@tiptap/react';

export interface ImageSaveOptions {
  editor?: Editor;
  serverAPI?: ImageServerAPI;
  upload?: (file: File) => Promise<string>;
  onSuccess?: (imageUrl: string, caption?: string) => void;
  onError?: (error: Error) => void;
}

export interface ImageSaveParams {
  imageData: Blob | string; //이미지 blob 또는 data URL
  caption?: string;
  filename?: string; // 파일명 (기본: 'image.png')
  insertToEditor?: boolean; // 에디터에 삽입할지 여부 (기본: true)
  onImageInserted?: (url: string, caption?: string) => void; // 에디터에 삽입 후 콜백
}

/**
 * @name useImageSave
 * @description 이미지 저장을 위한 통합 훅 서버 업로드 또는 로컬 URL 생성
 */
export function useImageSave(options: ImageSaveOptions = {}) {
  const { editor, serverAPI, upload, onSuccess, onError } = options;

  const saveImage = useCallback(
    async (params: ImageSaveParams) => {
      const { imageData, caption = '', filename = 'image.png', insertToEditor = true, onImageInserted } = params;

      try {
        // 1. Blob 준비
        let blob: Blob;
        if (imageData instanceof Blob) {
          blob = imageData;
        } else {
          // Data URL인 경우 Blob으로 변환
          const response = await fetch(imageData);
          blob = await response.blob();
        }

        // 2. File 객체 생성
        const file = new File([blob], filename, { type: blob.type || 'image/png' });

        // 3. 업로드 처리
        let imageUrl: string;

        if (serverAPI) {
          // 서버 API 사용
          const uploadResponse = await serverAPI.upload(file);
          imageUrl = uploadResponse.url;
        } else if (upload) {
          imageUrl = await upload(file);
        } else {
          // 기본 업로드 함수 사용 (development 환경에서는 로컬 URL)
          try {
            imageUrl = await handleImageUpload(file);
          } catch {
            imageUrl = URL.createObjectURL(blob);
          }
        }

        if (insertToEditor && editor) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (editor as any).commands.setResizableImage({
            src: imageUrl,
            alt: caption || 'Image',
            caption,
          });
        }

        onImageInserted?.(imageUrl, caption);
        onSuccess?.(imageUrl, caption);

        return {
          success: true,
          imageUrl,
          caption,
        };
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Failed to save image');
        // eslint-disable-next-line no-console
        console.error('Image save failed:', errorObj);
        onError?.(errorObj);

        return {
          success: false,
          error: errorObj,
        };
      }
    },
    [editor, serverAPI, upload, onSuccess, onError]
  );

  return {
    saveImage,
  };
}
