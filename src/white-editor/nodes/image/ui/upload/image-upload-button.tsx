import * as React from 'react';

import { ImagePlusIcon } from 'lucide-react';
import { handleImageUpload as defaultHandleImageUpload, useTranslate } from '@/shared';
import { Button, type ButtonProps } from '@/shared/components';
import { useImageUploadConfig } from '@/shared/contexts';
import { useTiptapEditor } from '@/shared/hooks';
import { useImageUpload, type UseImageUploadConfig } from '@/white-editor';
import type { Editor } from '@tiptap/react';

/** 툴바에서 사용자에게 노출되는 UI 전용 props (icon, className) */
export interface ImageToolbarButtonProps {
  icon?: React.ReactNode;
  className?: string;
}

export interface ImageUploadButtonProps extends Omit<ButtonProps, 'type'>, UseImageUploadConfig {
  icon?: React.ReactNode;
}

export const ImageUploadButton = React.forwardRef<HTMLButtonElement, ImageUploadButtonProps>(
  ({ editor: providedEditor, icon, hideWhenUnavailable = false, onInserted, onClick, ...buttonProps }, ref) => {
    const { editor } = useTiptapEditor(providedEditor);
    const t = useTranslate();
    const config = useImageUploadConfig();
    const inputRef = React.useRef<HTMLInputElement>(null);

    const { accept = 'image/*', maxSize, limit = 1, upload, onError, onSuccess, onImageInserted } = config;

    const { isVisible, canInsert, label, isActive } = useImageUpload({
      editor,
      hideWhenUnavailable,
      onInserted,
    });

    const wrappedUpload = React.useCallback(
      async (file: File, onProgress: (event: { progress: number }) => void, signal: AbortSignal) => {
        if (upload) {
          let currentProgress = 0;
          const progressInterval = setInterval(() => {
            currentProgress += 10;
            if (currentProgress <= 90) {
              onProgress({ progress: currentProgress });
            }
          }, 100);
          try {
            const url = await upload(file);
            clearInterval(progressInterval);
            onProgress({ progress: 100 });
            return url;
          } catch (error) {
            clearInterval(progressInterval);
            throw error;
          }
        }
        return defaultHandleImageUpload(file, onProgress, signal);
      },
      [upload]
    );

    const handleFileChange = React.useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !editor) return;
        const fileList = Array.from(files);
        if (limit && fileList.length > limit) {
          onError?.(new Error(`최대 ${limit}개까지 선택할 수 있습니다.`));
          return;
        }
        const maxBytes = maxSize ?? 50 * 1024 * 1024;
        for (const file of fileList) {
          if (file.size > maxBytes) {
            onError?.(new Error(`파일 크기는 ${maxBytes / 1024 / 1024}MB 이하여야 합니다.`));
            continue;
          }
        }

        const uploadFn = wrappedUpload;
        const items: { file: File; uploadId: string; blobUrl: string }[] = [];

        for (const file of fileList) {
          const uploadId = crypto.randomUUID();
          const blobUrl = URL.createObjectURL(file);
          items.push({ file, uploadId, blobUrl });
          (editor as Editor).commands.setResizableImage({
            src: blobUrl,
            alt: 'Image',
            caption: '',
            width: '500px',
            height: 'auto',
            uploadId,
            uploadingProgress: 0,
          });
        }

        const runUpload = async (item: (typeof items)[0]) => {
          try {
            const url = await uploadFn(
              item.file,
              (event) => {
                (editor as Editor).commands.updateImageUploadState(item.uploadId, { progress: event.progress });
              },
              new AbortController().signal
            );
            if (url) {
              (editor as Editor).commands.updateImageUploadState(item.uploadId, { src: url });
              onSuccess?.(url);
              onImageInserted?.(url, '');
            }
          } catch (err) {
            (editor as Editor).commands.updateImageUploadState(item.uploadId, {
              uploadError: true,
              uploadErrorFileName: item.file.name,
            });
            onError?.(err instanceof Error ? err : new Error('Upload failed'));
          } finally {
            URL.revokeObjectURL(item.blobUrl);
          }
        };

        void Promise.all(items.map(runUpload));

        if (inputRef.current) inputRef.current.value = '';
      },
      [editor, limit, maxSize, wrappedUpload, onError, onSuccess, onImageInserted]
    );

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (inputRef.current) {
          inputRef.current.value = '';
          inputRef.current.click();
        }
      },
      [onClick]
    );

    if (!isVisible) {
      return null;
    }

    return (
      <>
        <Button
          type='button'
          size='icon'
          data-style='ghost'
          data-active-state={isActive ? 'on' : 'off'}
          role='button'
          tabIndex={-1}
          disabled={!canInsert}
          data-disabled={!canInsert}
          aria-label={label}
          aria-pressed={isActive}
          tooltip={t('image')}
          onClick={handleClick}
          {...buttonProps}
          ref={ref}
        >
          <>{icon || <ImagePlusIcon />}</>
        </Button>
        <input
          ref={inputRef}
          name='file'
          accept={accept}
          type='file'
          multiple={limit > 1}
          onChange={handleFileChange}
          onClick={(e: React.MouseEvent<HTMLInputElement>) => e.stopPropagation()}
          style={{ display: 'none' }}
        />
      </>
    );
  }
);

ImageUploadButton.displayName = 'ImageUploadButton';
