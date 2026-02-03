import { useRef, useState } from 'react';
import { cn, Dialog, DialogContent, DialogHeader, DialogTitle, getTranslate } from '@/shared';
import { ImageEditor, ImageEditorFooter, type ImageEditorRef } from '@/white-editor';

interface ImageEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  onSave: (file: File) => void;
  cancelText?: string;
  saveText?: string;
}

export function ImageEditDialog(props: ImageEditDialogProps) {
  const { isOpen, onOpenChange, imageUrl, onSave, cancelText, saveText } = props;

  const imageRef = useRef<ImageEditorRef>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<string | null>(null);

  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      const editedDataBlob = await imageRef.current?.getEditedImageAsBlob();

      if (editedDataBlob) {
        const file = new File([editedDataBlob], 'edited-image.png', { type: editedDataBlob.type });
        onSave(file);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton
        className={cn(
          'white-editor we:min-h-[574px] we:max-h-[90vh] we:overflow-y-auto we:max-w-[972px] we:min-w-[600px] we:px-0 we:text-text-normal we:p-0! we:gap-0! we:flex we:flex-col'
        )}
        style={{
          width: '90vw',
        }}
        onInteractOutside={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className='we:px-4 we:pt-5 we:border-b we:border-border-default we:pb-4'>
          <DialogTitle className='we:text-[16px] we:text-text-normal'>{getTranslate('이미지 편집')}</DialogTitle>
        </DialogHeader>

        <div
          className={cn(
            'we:relative we:flex we:min-h-0 we:flex-1 we:w-full we:items-start we:justify-center we:overflow-y-auto we:overflow-x-hidden',
            isSaving ? 'we:pointer-events-none we:opacity-60' : ''
          )}
        >
          <ImageEditor ref={imageRef} imageUrl={imageUrl} activeMode={activeMode} setActiveMode={setActiveMode} />
        </div>

        {!activeMode && (
          <ImageEditorFooter
            onCancel={() => onOpenChange(false)}
            onApply={handleSaveClick}
            cancelLabel={cancelText || getTranslate('취소')}
            applyLabel={saveText || getTranslate('확인')}
            isApplyLoading={isSaving}
            isApplyDisabled={isSaving}
            isCancelDisabled={isSaving}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
