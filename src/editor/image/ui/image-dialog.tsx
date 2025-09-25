import * as React from 'react';
import { XIcon } from 'lucide-react';
import type { ImageUploadConfig } from '@/editor';
import {
  type UploadOptions,
  ImageUploadButton,
  ImageUploadDragArea,
  ImageUploadingProgress,
  useFileUpload,
  ImageEditor,
} from '@/editor';
import { handleImageUpload } from '@/shared';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components';

export interface ImageDialogProps extends Partial<ImageUploadConfig> {
  cancelText?: string;
  saveText?: string;
  icon?: React.ReactNode;
  imageConfig?: ImageUploadConfig;
}

export function ImageModal(props: ImageDialogProps) {
  const { cancelText, saveText, accept = 'image/*', maxSize, limit = 1, upload, onError, onSuccess, icon } = props;

  const [isOpen, setIsOpen] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const inputRef = React.useRef<HTMLInputElement>(null);

  const uploadOptions: UploadOptions = {
    maxSize: maxSize || 50 * 1024 * 1024,
    limit,
    accept,
    upload: upload || handleImageUpload,
    onSuccess,
    onError,
  };

  const { fileItems, uploadFiles, removeFileItem, clearAllFiles } = useFileUpload(uploadOptions);

  const handleUpload = async (files: File[]) => {
    try {
      const urls = await uploadFiles(files);

      if (urls.length > 0) {
        setPreviewUrl(urls[0]);
        onSuccess?.(urls[0]);
      }
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

  const handleRemovePreview = () => {
    clearAllFiles();
    setPreviewUrl(null);
  };

  const handleCancel = () => {
    handleRemovePreview();
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      handleRemovePreview();
    }
  };

  const hasFiles = fileItems.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange} modal>
      <DialogTrigger asChild>
        <ImageUploadButton icon={icon} />
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] w-full min-w-[400px]' onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
        </DialogHeader>

        {previewUrl && (
          <div className='relative flex w-full items-center justify-center overflow-y-auto'>
            <ImageEditor imageUrl={previewUrl || ''} />
            <Button
              type='button'
              variant='ghost'
              onClick={handleRemovePreview}
              className='absolute top-12 right-2 z-10 h-8 w-8 cursor-pointer bg-white/10 hover:bg-white/20'
            >
              <XIcon className='text-border' />
            </Button>
          </div>
        )}

        <div className='flex flex-col gap-2' onClick={handleClick}>
          {hasFiles && !previewUrl && (
            <div>
              {fileItems.map((fileItem) => (
                <ImageUploadingProgress
                  key={fileItem.id}
                  fileItem={fileItem}
                  onRemove={() => {
                    removeFileItem(fileItem.id);
                    setPreviewUrl(null);
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

        {hasFiles && (
          <DialogFooter className=''>
            <Button type='button' variant='secondary' onClick={handleCancel}>
              {cancelText || 'cancel'}
            </Button>

            <Button type='button' variant='default' onClick={handleClick}>
              {saveText || 'save'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
