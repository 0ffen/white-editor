import { useCallback } from 'react';
import { EDITOR_COLORS } from '@/editor';
import { Button, cn, Slider } from '@/shared';
import type { default as TuiImageEditorType } from 'tui-image-editor';

interface DrawEditorProps {
  editorRef: React.RefObject<TuiImageEditorType | null>;
  activeMode: string | null;
  drawingColor: string;
  setDrawingColor: (color: string) => void;
  drawingRange: number;
  setDrawingRange: (range: number) => void;
}

export function DrawEditor(props: DrawEditorProps) {
  const { drawingColor, setDrawingColor, drawingRange, editorRef, activeMode, setDrawingRange } = props;

  const handleDrawingRangeChange = useCallback(
    (value: number[]) => {
      setDrawingRange(value[0]);

      if (editorRef.current && activeMode === 'draw') {
        editorRef.current.setBrush({
          width: value[0],
          color: drawingColor,
        });
      }
    },
    [editorRef, activeMode, drawingColor, setDrawingRange]
  );

  const handleDrawingColorChange = useCallback(
    (color: string) => {
      setDrawingColor(color);
      if (editorRef.current && activeMode === 'draw') {
        editorRef.current.setBrush({
          width: drawingRange,
          color: color,
        });
      }
    },
    [editorRef, activeMode, drawingRange, setDrawingColor]
  );

  return (
    <div className='flex flex-col items-center justify-center gap-4 space-y-4 p-2'>
      <div className='flex w-full flex-col space-y-2'>
        <h3 className='text-muted-foreground text-xs font-medium'>Brush Color</h3>
        <div className='flex flex-wrap items-center gap-3'>
          {EDITOR_COLORS.map((color) => (
            <Button
              type='button'
              key={color.value}
              className={cn(
                'h-6 w-6 cursor-pointer rounded-4xl border transition-all',
                drawingColor === color.hex && 'outline-primary outline-2'
              )}
              style={{ backgroundColor: color.value, borderColor: color.border }}
              onClick={() => handleDrawingColorChange(color.hex)}
              title={color.label}
              aria-label={`${color.label} color`}
              isActive={drawingColor === color.hex}
            />
          ))}
        </div>
      </div>
      <div className='flex w-full flex-col space-y-2'>
        <h3 className='text-muted-foreground text-xs font-medium'>Brush Size</h3>
        <div className='flex items-center gap-3'>
          <Slider
            max={50}
            step={10}
            min={1}
            defaultValue={[drawingRange]}
            onValueChange={(value: number[]) => {
              handleDrawingRangeChange(value);
            }}
          />
          <span className='text-muted-foreground w-8 text-center text-xs'>{drawingRange}</span>
        </div>
      </div>
    </div>
  );
}
