import { CropIcon, PencilIcon, Redo2, Square, TypeIcon, Undo2 } from 'lucide-react';
import { Button, getTranslate, Separator, Toolbar } from '@/shared';

import type { default as TuiImageEditorType } from 'tui-image-editor';

interface ImageEditorToolbarProps {
  editorRef: React.RefObject<TuiImageEditorType | null>;
  activeMode: string | null;
  handleModeChange: (mode: string | null) => void;
}

export function ImageEditorToolbar(props: ImageEditorToolbarProps) {
  const { editorRef, activeMode, handleModeChange } = props;

  return (
    <div className='we:h-[44px] we:text-text-sub we:flex-shrink-0'>
      <Toolbar className='we:border-none'>
        <Button
          type='button'
          className='we:h-fit we:w-fit'
          variant='ghost'
          size='icon'
          onClick={() => {
            if (editorRef.current) {
              editorRef.current?.undo();
            }
          }}
          tooltip={getTranslate('실행 취소')}
        >
          <Undo2 />
        </Button>
        <Button
          type='button'
          className='we:h-fit we:w-fit'
          variant='ghost'
          size='icon'
          onClick={() => editorRef.current?.redo()}
          tooltip={getTranslate('다시 실행')}
        >
          <Redo2 />
        </Button>

        <Separator orientation='vertical' className='we:mx-3 we:h-full we:min-h-4' />

        <Button
          type='button'
          className='we:h-fit we:w-fit'
          variant='ghost'
          size='icon'
          isActive={activeMode === 'crop'}
          onClick={() => handleModeChange(activeMode === 'crop' ? null : 'crop')}
          tooltip={getTranslate('자르기')}
        >
          <CropIcon />
        </Button>

        <Button
          type='button'
          className='we:h-fit we:w-fit'
          variant='ghost'
          size='icon'
          isActive={activeMode === 'text'}
          onClick={() => handleModeChange(activeMode === 'text' ? null : 'text')}
          tooltip={getTranslate('글자 넣기')}
        >
          <TypeIcon />
        </Button>

        <Button
          type='button'
          className='we:h-fit we:w-fit'
          variant='ghost'
          size='icon'
          isActive={activeMode === 'draw'}
          onClick={() => handleModeChange(activeMode === 'draw' ? null : 'draw')}
          tooltip={getTranslate('그리기')}
        >
          <PencilIcon />
        </Button>

        <Button
          type='button'
          className='we:h-fit we:w-fit'
          variant='ghost'
          size='icon'
          isActive={activeMode === 'shape'}
          onClick={() => handleModeChange(activeMode === 'shape' ? null : 'shape')}
          tooltip={getTranslate('도형 추가')}
        >
          <Square />
        </Button>
      </Toolbar>
    </div>
  );
}
