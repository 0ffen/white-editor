import { Check, XIcon } from 'lucide-react';
import { Button } from '@/shared';
import type { default as TuiImageEditorType } from 'tui-image-editor';

interface CropEditorProps {
  editorRef: React.RefObject<TuiImageEditorType | null>;
  setActiveMode: (mode: string | null) => void;
}

export function CropEditor(props: CropEditorProps) {
  const { editorRef, setActiveMode } = props;

  const applyCrop = async () => {
    if (!editorRef.current) return;
    await editorRef.current.crop(editorRef.current.getCropzoneRect());
    editorRef.current.stopDrawingMode();
    setActiveMode(null);
  };

  const stopCropMode = () => {
    editorRef.current?.stopDrawingMode();
    setActiveMode(null);
  };

  return (
    <div className='we:flex we:items-start we:justify-center we:gap-3 we:space-y-2 we:p-2'>
      <Button className='we:h-6 we:w-6 we:rounded-4xl' variant='secondary' onClick={stopCropMode}>
        <XIcon />
      </Button>
      <Button className='we:h-6 we:w-6 we:rounded-4xl' type='button' variant='default' onClick={applyCrop}>
        <Check />
      </Button>
    </div>
  );
}
