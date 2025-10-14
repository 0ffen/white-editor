import { CropIcon, PencilIcon, Redo2, Square, TypeIcon, Undo2 } from 'lucide-react';
import { Button, Toolbar } from '@/shared';
import type { default as TuiImageEditorType } from 'tui-image-editor';

interface ImageEditorToolbarProps {
  editorRef: React.RefObject<TuiImageEditorType | null>;
  activeMode: string | null;
  handleModeChange: (mode: string | null) => void;
}

export function ImageEditorToolbar(props: ImageEditorToolbarProps) {
  const { editorRef, activeMode, handleModeChange } = props;

  return (
    <div className='we:h-[44px] we:flex-shrink-0'>
      <Toolbar className='we:border-none'>
        <Button
          type='button'
          className='we:h-fit we:w-fit'
          variant='ghost'
          onClick={() => {
            if (editorRef.current) {
              editorRef.current?.undo();
            }
          }}
        >
          <Undo2 />
        </Button>
        <Button type='button' className='we:h-fit we:w-fit' variant='ghost' onClick={() => editorRef.current?.redo()}>
          <Redo2 />
        </Button>

        <Button
          type='button'
          className='we:h-fit we:w-fit'
          variant='ghost'
          isActive={activeMode === 'crop'}
          onClick={() => handleModeChange(activeMode === 'crop' ? null : 'crop')}
        >
          <CropIcon />
        </Button>

        <Button
          type='button'
          className='we:h-fit we:w-fit'
          variant='ghost'
          isActive={activeMode === 'text'}
          onClick={() => handleModeChange(activeMode === 'text' ? null : 'text')}
        >
          <TypeIcon />
        </Button>

        <Button
          type='button'
          className='we:h-fit we:w-fit'
          variant='ghost'
          isActive={activeMode === 'draw'}
          onClick={() => handleModeChange(activeMode === 'draw' ? null : 'draw')}
        >
          <PencilIcon />
        </Button>

        <Button
          type='button'
          className='we:h-fit we:w-fit'
          variant='ghost'
          isActive={activeMode === 'shape'}
          onClick={() => handleModeChange(activeMode === 'shape' ? null : 'shape')}
        >
          <Square />
        </Button>
      </Toolbar>
    </div>
  );
}
