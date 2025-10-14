import { useCallback } from 'react';
import { Button, cn, Slider } from '@/shared';
import { EDITOR_COLORS } from '@/white-editor';
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
    <div className='we:flex we:flex-col we:items-center we:justify-center we:gap-4 we:space-y-4 we:p-2'>
      <div className='we:flex we:w-full we:flex-col we:space-y-2'>
        <h3 className='we:text-muted-foreground we:text-xs we:font-medium'>Brush Color</h3>
        <div className='we:flex we:flex-wrap we:items-center we:gap-3'>
          {EDITOR_COLORS.map((color) => (
            <Button
              type='button'
              key={color.value}
              className={cn(
                'we:h-6 we:w-6 we:cursor-pointer we:rounded-4xl we:border we:transition-all',
                drawingColor === color.hex && 'we:ring-2 we:ring-blue-500 we:ring-offset-0'
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
      <div className='we:flex we:w-full we:flex-col we:space-y-2'>
        <h3 className='we:text-muted-foreground we:text-xs we:font-medium'>Brush Size</h3>
        <div className='we:flex we:items-center we:gap-3'>
          <Slider
            max={50}
            step={10}
            min={1}
            defaultValue={[drawingRange]}
            onValueChange={(value: number[]) => {
              handleDrawingRangeChange(value);
            }}
          />
          <span className='we:text-muted-foreground we:w-8 we:text-center we:text-xs'>{drawingRange}</span>
        </div>
      </div>
    </div>
  );
}
