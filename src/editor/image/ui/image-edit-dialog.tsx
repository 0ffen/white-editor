import { useRef, useState } from 'react';
import { ImageEditor, type ImageEditorRef } from '@/editor';
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared';

interface ImageEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  currentCaption: string;
  onSave: (imageUrl: string, caption: string) => void;
}

export function ImageEditDialog(props: ImageEditDialogProps) {
  const { isOpen, onOpenChange, imageUrl, currentCaption, onSave } = props;

  const imageRef = useRef<ImageEditorRef>(null);
  const [caption, setCaption] = useState<string>(currentCaption);

  const handleCaptionChange = (newCaption: string) => {
    setCaption(newCaption);
  };

  const handleSaveClick = () => {
    try {
      const editedDataURL = imageRef.current?.toDataURL();
      const srcToSave = editedDataURL || imageUrl;
      onSave(srcToSave, caption);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      onSave(imageUrl, caption);
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
          <Button type='button' variant='secondary' onClick={() => onOpenChange(false)}>
            {'Cancel'}
          </Button>
          <Button type='button' variant='default' onClick={handleSaveClick} className='min-w-20'>
            {'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
