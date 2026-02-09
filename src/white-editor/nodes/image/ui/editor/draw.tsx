import { useCallback } from 'react';
import { Button, cn, getTranslate, Slider } from '@/shared';
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
    <div className='we:flex we:flex-col we:items-center we:justify-center we:gap-2 we:space-y-2 we:py-4'>
      <div className='we:flex we:w-full we:gap-2 we:items-center'>
        <h3 className='we:text-text-normal we:text-sm we:m-0! we:min-w-[80px]'>{getTranslate('브러시 색상')}</h3>
        <div className='we:flex we:flex-wrap we:items-center we:gap-1'>
          {EDITOR_COLORS.map((color) => (
            <Button
              type='button'
              size='icon'
              key={color.value}
              className={cn(
                'we:h-6 we:w-6 we:cursor-pointer we:rounded-4xl we:border we:transition-all we:m-1',
                drawingColor === color.editorHex && 'we:ring-2 we:ring-brand-default we:ring-offset-1'
              )}
              style={{ backgroundColor: color.value, borderColor: color.border }}
              onClick={() => handleDrawingColorChange(color.editorHex)}
              title={color.label}
              aria-label={`${color.label} color`}
              isActive={drawingColor === color.editorHex}
            />
          ))}
        </div>
      </div>
      <div className='we:flex we:w-full we:gap-2 we:items-center'>
        <h3 className='we:text-text-normal we:text-sm we:m-0! we:min-w-[80px]'>{getTranslate('두께')}</h3>
        <div className='we:flex we:w-full we:items-center we:gap-3'>
          <Slider
            max={50}
            step={1}
            min={1}
            defaultValue={[drawingRange]}
            onValueChange={(value: number[]) => {
              handleDrawingRangeChange(value);
            }}
          />
          <span className='we:text-text-light we:w-8 we:text-center we:text-sm'>{drawingRange}</span>
        </div>
      </div>
    </div>
  );
}
