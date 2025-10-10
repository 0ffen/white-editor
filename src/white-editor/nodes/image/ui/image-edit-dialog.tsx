import { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared';
import { ImageEditor, type ImageEditorRef } from '@/white-editor';

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
      <DialogContent
        className='we:max-h-[90vh] we:w-full we:min-w-[400px]'
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Edit Image</DialogTitle>
        </DialogHeader>

        <div className='we:relative we:flex we:w-full we:items-center we:justify-center we:overflow-y-auto'>
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
          <Button type='button' variant='default' onClick={handleSaveClick} className='we:min-w-20' disabled={isSaving}>
            {isSaving ? <Loader2 className='we:h-4 we:w-4 we:animate-spin' /> : saveText || 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
