import * as React from 'react';
import { useCallback } from 'react';
import { Loader2, XIcon } from 'lucide-react';
import { cn, handleImageUpload } from '@/shared';
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
  useFileUpload,
  ImageEditor,
  useImageSave,
  type ImageEditorRef,
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
  imageConfig?: ImageUploadConfig;
  editor?: Editor | null;
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
    onImageInserted,
  } = props;

  const { editor } = useTiptapEditor(providedEditor);
  // 이미지 저장 훅 사용
  const { saveImage } = useImageSave({
    editor: editor ?? undefined,
    upload,
    onSuccess,
    onError,
  });

  const [isOpen, setIsOpen] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [caption, setCaption] = React.useState<string>('');
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [activeMode, setActiveMode] = React.useState<string | null>(null);

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
      <DialogContent
        className={cn('we:max-h-[95vh]', previewUrl ? 'we:max-w-[800px]' : 'we:max-w-[500px] we:min-w-[400px]')}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
        </DialogHeader>

        {previewUrl && (
          <div
            className={cn(
              'we:relative we:flex we:w-full we:items-center we:justify-center we:overflow-auto',
              isSaving ? 'we:pointer-events-none we:opacity-60' : ''
            )}
          >
            <ImageEditor
              ref={imageEditorRef}
              imageUrl={previewUrl || ''}
              onCaptionChange={setCaption}
              defaultCaption={caption}
              activeMode={activeMode}
              setActiveMode={setActiveMode}
            />
            <Button
              type='button'
              variant='ghost'
              onClick={handleRemovePreview}
              className='we:absolute we:top-12 we:right-2 we:z-10 we:h-8 we:w-8 we:cursor-pointer we:bg-white/10 we:hover:bg-white/20'
            >
              <XIcon className='we:text-border' />
            </Button>
          </div>
        )}

        <div className='we:flex we:flex-col we:gap-2' onClick={handleClick}>
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

        {hasFiles && previewUrl && !activeMode && (
          <DialogFooter className=''>
            <Button type='button' variant='secondary' onClick={handleCancel} disabled={isSaving}>
              {cancelText || 'Cancel'}
            </Button>

            <Button type='button' variant='default' onClick={handleSave} className='we:min-w-20' disabled={isSaving}>
              {isSaving ? <Loader2 className='we:h-4 we:w-4 we:animate-spin' /> : saveText || 'Upload'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
