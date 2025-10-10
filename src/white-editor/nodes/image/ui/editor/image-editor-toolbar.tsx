import { CropIcon, PencilIcon, Redo2, Square, TypeIcon, Undo2 } from 'lucide-react';
import { Toolbar, ToolbarButton } from '@/shared';
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
        <ToolbarButton
          onClick={() => {
            if (editorRef.current) {
              editorRef.current?.undo();
            }
          }}
          tooltip='Undo'
        >
          <Undo2 />
        </ToolbarButton>
        <ToolbarButton onClick={() => editorRef.current?.redo()} tooltip='Redo'>
          <Redo2 />
        </ToolbarButton>

        <ToolbarButton
          isActive={activeMode === 'crop'}
          tooltip='Crop'
          onClick={() => handleModeChange(activeMode === 'crop' ? null : 'crop')}
        >
          <CropIcon />
        </ToolbarButton>

        <ToolbarButton
          isActive={activeMode === 'text'}
          tooltip='Text'
          onClick={() => handleModeChange(activeMode === 'text' ? null : 'text')}
        >
          <TypeIcon />
        </ToolbarButton>

        <ToolbarButton
          isActive={activeMode === 'draw'}
          tooltip='Draw'
          onClick={() => handleModeChange(activeMode === 'draw' ? null : 'draw')}
        >
          <PencilIcon />
        </ToolbarButton>

        <ToolbarButton
          isActive={activeMode === 'shape'}
          tooltip='Shape'
          onClick={() => handleModeChange(activeMode === 'shape' ? null : 'shape')}
        >
          <Square />
        </ToolbarButton>
      </Toolbar>
    </div>
  );
}
