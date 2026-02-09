import * as React from 'react';
import { handleImageUpload } from '@/shared';
import { useTiptapEditor } from '@/shared/hooks';
import { ImageUploadButton } from '@/white-editor';
import type { Editor } from '@tiptap/react';

export interface ImageUploadConfig {
  accept?: string;
  maxSize?: number;
  limit?: number;
  upload?: (file: File) => Promise<string>;
  onError?: (error: Error) => void;
  onSuccess?: (result: string) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (url: string, caption: string) => void;
  imageUrl?: string;
  currentCaption?: string;
  closeOnError?: boolean;
}

export interface ImageDialogProps extends Partial<ImageUploadConfig> {
  cancelText?: string;
  saveText?: string;
  icon?: React.ReactNode;
  editor?: Editor | null;
  onImageInserted?: (url: string, caption?: string) => void;
}

/**
 * 노션 스타일 인라인 이미지 업로드: 모달 없이 버튼 클릭 → 파일 선택 시 에디터에 이미지가 바로 삽입되고,
 * 이미지 위에 업로드 뱃지가 표시되며, 완료 시 뱃지가 사라짐.
 */
export function ImageDialog(props: ImageDialogProps) {
  const {
    accept = 'image/*',
    maxSize,
    limit = 1,
    upload,
    onError,
    onSuccess,
    icon,
    editor: providedEditor,
    onImageInserted,
  } = props;

  const { editor } = useTiptapEditor(providedEditor);
  const inputRef = React.useRef<HTMLInputElement>(null);

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
      return handleImageUpload(file, onProgress, signal);
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

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.click();
    }
  };

  return (
    <>
      <ImageUploadButton
        icon={icon}
        editor={providedEditor}
        onClick={(e) => {
          e.preventDefault();
          handleClick();
        }}
      />
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
