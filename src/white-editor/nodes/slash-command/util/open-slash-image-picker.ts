'use client';

import { v4 as uuidv4 } from 'uuid';
import {
  addImageUploadPlaceholder,
  completeImageUploadPlaceholder,
  setImageUploadPlaceholderError,
  updateImageUploadPlaceholderProgress,
} from '@/white-editor/nodes/image/extension/image-upload-placeholder';
import type { Editor } from '@tiptap/core';

type ImageUploadConfig = {
  upload?: (file: File) => Promise<string>;
  accept?: string;
  maxSize?: number;
  limit?: number;
  onError?: (error: Error) => void;
  onSuccess?: (url: string) => void;
  onImageInserted?: (url: string, caption?: string) => void;
};

function getImageUploadConfig(editor: Editor): ImageUploadConfig {
  // ResizableImage storage (extension name: 'image')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imageStorage = (editor.storage as any).image as { extension?: { imageUpload?: ImageUploadConfig } } | undefined;
  return imageStorage?.extension?.imageUpload ?? {};
}

/**
 * 슬래시 메뉴에서 이미지 항목 선택 시 파일 선택 → placeholder 업로드 플로우.
 * ImageUploadButton과 동일하게 decoration placeholder를 사용한다.
 */
export function openSlashImagePicker(editor: Editor): void {
  if (!editor.isEditable || editor.isDestroyed) return;

  const config = getImageUploadConfig(editor);
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = config.accept ?? 'image/*';
  input.multiple = false;

  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;

    const maxBytes = config.maxSize ?? 50 * 1024 * 1024;
    if (file.size > maxBytes) {
      config.onError?.(new Error(`파일 크기는 ${maxBytes / 1024 / 1024}MB 이하여야 합니다.`));
      return;
    }

    const uploadId = uuidv4();
    const previewUrl = URL.createObjectURL(file);
    const view = editor.view;
    const insertPos = editor.state.selection.from;

    addImageUploadPlaceholder(view, { id: uploadId, pos: insertPos, previewUrl, fileName: file.name });

    try {
      const upload = config.upload;
      if (!upload) {
        setImageUploadPlaceholderError(view, uploadId, file.name);
        config.onError?.(new Error('이미지 업로드 함수가 없습니다.'));
        return;
      }

      let progress = 0;
      const timer = window.setInterval(() => {
        progress = Math.min(progress + 10, 90);
        if (!editor.isDestroyed) {
          updateImageUploadPlaceholderProgress(view, uploadId, progress);
        }
      }, 100);

      const url = await upload(file);
      window.clearInterval(timer);

      if (editor.isDestroyed) return;

      updateImageUploadPlaceholderProgress(view, uploadId, 100);
      if (url) {
        const inserted = completeImageUploadPlaceholder(view, uploadId, { src: url });
        if (inserted) {
          config.onSuccess?.(url);
          config.onImageInserted?.(url, '');
        }
      } else {
        setImageUploadPlaceholderError(view, uploadId, file.name);
      }
    } catch (err) {
      if (!editor.isDestroyed) {
        setImageUploadPlaceholderError(view, uploadId, file.name);
      }
      config.onError?.(err instanceof Error ? err : new Error('Upload failed'));
    } finally {
      URL.revokeObjectURL(previewUrl);
    }
  };

  input.click();
}
