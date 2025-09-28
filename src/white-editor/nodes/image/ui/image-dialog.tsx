import * as React from 'react';
import { useCallback } from 'react';
import { Loader2, XIcon } from 'lucide-react';
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
import { useTiptapEditor } from '@/shared/hooks';
import {
  type UploadOptions,
  ImageUploadButton,
  ImageUploadDragArea,
  ImageUploadingProgress,
  useFileUpload,
  ImageEditor,
  useImageSave,
  type ImageServerAPI,
  type ImageEditorRef,
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
  imageConfig?: ImageUploadConfig;
  editor?: Editor | null;
  serverAPI?: ImageServerAPI;
  onImageInserted?: (url: string, caption?: string) => void;
}

export function ImageDialog(props: ImageDialogProps) {
  const {
    cancelText,
    saveText,
    accept = 'image/*',
    maxSize,
    limit = 1,
    upload,
    onError,
    onSuccess,
    icon,
    editor: providedEditor,
    serverAPI,
    onImageInserted,
  } = props;

  const { editor } = useTiptapEditor(providedEditor);
  // 이미지 저장 훅 사용
  const { saveImage } = useImageSave({
    editor: editor ?? undefined,
    serverAPI,
    upload,
    onSuccess,
    onError,
  });

  const [isOpen, setIsOpen] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [caption, setCaption] = React.useState<string>('');
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  const imageEditorRef = React.useRef<ImageEditorRef>(null);

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

  const handleRemovePreview = useCallback(() => {
    clearAllFiles();
    setPreviewUrl(null);
    setCaption('');
  }, [clearAllFiles]);

  const handleCancel = () => {
    handleRemovePreview();
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      handleRemovePreview();
      setCaption('');
    }
  };

  const handleSave = useCallback(async () => {
    if (!editor || !previewUrl || fileItems.length === 0) {
      return;
    }
    setIsSaving(true);
    try {
      const editedImageBlob = imageEditorRef.current?.toDataURL();
      const imageDataToUse = editedImageBlob || previewUrl;
      const filename = `${fileItems[0].file.name}.png`;
      const currentCaption = caption;

      const result = await saveImage({
        imageData: imageDataToUse,
        caption: currentCaption,
        filename,
        insertToEditor: true,
        onImageInserted,
      });

      if (result.success) {
        setIsOpen(false);
        handleRemovePreview();
      }
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Failed to save image'));
    } finally {
      setIsSaving(false);
    }
  }, [editor, previewUrl, fileItems, caption, saveImage, onImageInserted, handleRemovePreview, onError]);

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
            <ImageEditor
              ref={imageEditorRef}
              imageUrl={previewUrl || ''}
              onCaptionChange={setCaption}
              defaultCaption={caption}
            />
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

        {hasFiles && previewUrl && (
          <DialogFooter className=''>
            <Button type='button' variant='secondary' onClick={handleCancel} disabled={isSaving}>
              {cancelText || 'Cancel'}
            </Button>

            <Button type='button' variant='default' onClick={handleSave} className='min-w-20' disabled={isSaving}>
              {isSaving ? <Loader2 className='h-4 w-4 animate-spin' /> : saveText || 'Save'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
