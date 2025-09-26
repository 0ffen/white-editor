import { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ImageEditor, type ImageEditorRef } from '@/editor';
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared';

interface ImageEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  currentCaption: string;
  onSave: (imageUrl: string, caption: string) => void;
  cancelText?: string;
  saveText?: string;
}

export function ImageEditDialog(props: ImageEditDialogProps) {
  const { isOpen, onOpenChange, imageUrl, currentCaption, onSave, cancelText, saveText } = props;

  const imageRef = useRef<ImageEditorRef>(null);
  const [caption, setCaption] = useState<string>(currentCaption);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleCaptionChange = (newCaption: string) => {
    setCaption(newCaption);
  };

  const handleSaveClick = () => {
    setIsSaving(true);
    try {
      const editedDataURL = imageRef.current?.toDataURL();
      const srcToSave = editedDataURL || imageUrl;
      onSave(srcToSave, caption);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      onSave(imageUrl, caption);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] w-full min-w-[400px]' onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Edit Image</DialogTitle>
        </DialogHeader>

        <div className='relative flex w-full items-center justify-center overflow-y-auto'>
          <ImageEditor
            ref={imageRef}
            imageUrl={imageUrl}
            onCaptionChange={handleCaptionChange}
            defaultCaption={caption}
          />
        </div>

        <DialogFooter>
          <Button type='button' variant='secondary' onClick={() => onOpenChange(false)} disabled={isSaving}>
            {cancelText || 'Cancel'}
          </Button>
          <Button type='button' variant='default' onClick={handleSaveClick} className='min-w-20' disabled={isSaving}>
            {isSaving ? <Loader2 className='h-4 w-4 animate-spin' /> : saveText || 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
