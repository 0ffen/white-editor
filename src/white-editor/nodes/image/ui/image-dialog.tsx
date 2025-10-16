import * as React from 'react';
import { cn, handleImageUpload } from '@/shared';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components';
import { useTiptapEditor } from '@/shared/hooks';
import {
  type UploadOptions,
  ImageUploadButton,
  ImageUploadDragArea,
  useFileUpload,
  ImageUploadingProgress,
} from '@/white-editor';
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
}

export interface ImageDialogProps extends Partial<ImageUploadConfig> {
  cancelText?: string;
  saveText?: string;
  icon?: React.ReactNode;
  editor?: Editor | null;
  onImageInserted?: (url: string, caption?: string) => void;
}

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

  const [isOpen, setIsOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const insertedFileIds = React.useRef<Set<string>>(new Set());

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
      } else {
        return handleImageUpload(file, onProgress, signal);
      }
    },
    [upload]
  );

  const uploadOptions: UploadOptions = {
    maxSize: maxSize || 50 * 1024 * 1024,
    limit,
    accept,
    upload: wrappedUpload,
    onSuccess,
    onError,
  };

  const { fileItems, uploadFiles, removeFileItem, clearFileItemsOnly } = useFileUpload(uploadOptions);

  // 업로드 완료 시 자동으로 에디터에 삽입
  React.useEffect(() => {
    const successfulItems = fileItems.filter(
      (item) => item.status === 'success' && item.url && !insertedFileIds.current.has(item.id)
    );

    if (successfulItems.length > 0 && editor) {
      successfulItems.forEach((item) => {
        if (item.url) {
          (editor as Editor).commands.setResizableImage({
            src: item.url,
            alt: 'Image',
            caption: '',
            width: '500px',
            height: 'auto',
          });
          onImageInserted?.(item.url, '');
          insertedFileIds.current.add(item.id);
        }
      });

      setTimeout(() => {
        setIsOpen(false);
        // URL을 revoke하지 않고 파일 목록만 비움 (이미지를 나중에 편집할 수 있도록)
        clearFileItemsOnly();
        insertedFileIds.current.clear();
      }, 300);
    }
  }, [fileItems, editor, onImageInserted, clearFileItemsOnly]);

  const handleUpload = async (files: File[]) => {
    try {
      await uploadFiles(files);
      // 업로드는 useFileUpload에서 처리되며, 완료되면 에디터에 삽입됨
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      onError?.(new Error('No file selected'));
      return;
    }
    handleUpload(Array.from(files));
  };

  const handleClick = () => {
    if (inputRef.current && fileItems.length === 0) {
      inputRef.current.value = '';
      inputRef.current.click();
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // 다이얼로그가 닫힐 때는 업로드 중인 것만 취소하고 URL은 revoke하지 않음
      clearFileItemsOnly();
    }
  };

  const hasFiles = fileItems.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange} modal>
      <DialogTrigger asChild>
        <ImageUploadButton icon={icon} />
      </DialogTrigger>
      <DialogContent
        className={cn('we:max-h-[95vh] we:max-w-[500px] we:min-w-[400px]')}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
        </DialogHeader>

        <div className='we:flex we:flex-col we:gap-2' onClick={handleClick}>
          {hasFiles && (
            <div>
              {fileItems.map((fileItem) => (
                <ImageUploadingProgress
                  key={fileItem.id}
                  fileItem={fileItem}
                  onRemove={() => {
                    removeFileItem(fileItem.id);
                  }}
                />
              ))}
            </div>
          )}

          {!hasFiles && (
            <>
              <ImageUploadDragArea onFile={handleUpload} limit={limit} maxSize={maxSize || 50 * 1024 * 1024} />
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
