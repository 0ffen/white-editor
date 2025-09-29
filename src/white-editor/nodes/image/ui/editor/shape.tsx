import { useCallback, useEffect, useState } from 'react';
import { Ban, Circle, Square, Triangle } from 'lucide-react';
import { Button, cn, Slider } from '@/shared';
import { EDITOR_COLORS } from '@/white-editor';
import type { default as TuiImageEditorType } from 'tui-image-editor';

interface ShapeEditorProps {
  editorRef: React.RefObject<TuiImageEditorType | null>;
}

const transparentColor = '#ffffff00';
const defaultColor = '#000000'; //black

export function ShapeEditor(props: ShapeEditorProps) {
  const { editorRef } = props;

  const [shapeFillColor, setShapeFillColor] = useState<string>(defaultColor);
  const [shapeStrokeColor, setShapeStrokeColor] = useState<string>(defaultColor);
  const [shapeStroke, setShapeStroke] = useState<number>(10);
  const [shapeType, setShapeType] = useState<string | null>(null);
  const [activeObjectId, setActiveObjectId] = useState<number | null>(null);

  const handleCreateShape = useCallback(
    (shape: 'rect' | 'triangle' | 'circle') => {
      setShapeType(shape);
      if (editorRef.current) {
        editorRef.current.startDrawingMode('SHAPE');
        editorRef.current.setDrawingShape(shape, {
          fill: shapeFillColor,
          stroke: shapeStrokeColor,
          strokeWidth: shapeStroke,
        });
      }
    },
    [editorRef, shapeFillColor, shapeStrokeColor, setShapeType, shapeStroke]
  );

  useEffect(() => {
    if (!editorRef.current) return;

    const handleObjectActivated = (obj: { id: number }) => {
      setActiveObjectId(obj?.id ?? null);
      setShapeType(null);
    };

    const handleSelectionCleared = () => {
      setActiveObjectId(null);
    };

    const handleObjectAdded = (obj: { type: string }) => {
      if (obj?.type === 'rect' || obj?.type === 'triangle' || obj?.type === 'circle') {
        editorRef.current?.stopDrawingMode();
        setShapeType(null);
      }
    };

    editorRef.current.on('objectActivated', handleObjectActivated);
    editorRef.current.on('selectionCleared', handleSelectionCleared);
    editorRef.current.on('objectAdded', handleObjectAdded);
  }, [editorRef, setShapeType]);

  const updateObjectById = (id: number, props: Record<string, string | number>) => {
    if (!editorRef.current) return;
    const obj = editorRef.current.getObjectProperties(id, props);
    if (obj) {
      editorRef.current.setObjectProperties(id, props);
    }
  };

  const handleShapeFillColorChange = (color: string) => {
    setShapeFillColor(color);

    if (activeObjectId) {
      updateObjectById(activeObjectId, { fill: color });
    } else if (shapeType) {
      editorRef.current?.setDrawingShape(shapeType, {
        fill: color,
        stroke: shapeStrokeColor,
        strokeWidth: shapeStroke,
      });
    }
  };

  const handleShapeStrokeColorChange = (color: string) => {
    setShapeStrokeColor(color);

    if (activeObjectId) {
      updateObjectById(activeObjectId, { stroke: color });
    } else if (shapeType) {
      editorRef.current?.setDrawingShape(shapeType, {
        fill: shapeFillColor,
        stroke: color,
        strokeWidth: shapeStroke,
      });
    }
  };

  const handleShapeStrokeChange = (value: number) => {
    setShapeStroke(value);

    if (activeObjectId) {
      updateObjectById(activeObjectId, { strokeWidth: value });
    } else if (shapeType) {
      editorRef.current?.setDrawingShape(shapeType, {
        fill: shapeFillColor,
        stroke: shapeStrokeColor,
        strokeWidth: value,
      });
    }
  };

  return (
    <div className='flex w-full flex-col gap-4 space-y-2 p-2'>
      <div className='flex w-full flex-col gap-2'>
        <h3 className='text-muted-foreground w-fit text-xs font-medium'>Shape</h3>
        <div className='flex items-center justify-center gap-2'>
          <Button
            type='button'
            size='default'
            variant='outline'
            onClick={() => handleCreateShape('rect')}
            isActive={shapeType === 'rect'}
            className='shadow-none'
          >
            <Square className='size-6' />
          </Button>
          <Button
            type='button'
            size='default'
            variant='outline'
            onClick={() => handleCreateShape('triangle')}
            isActive={shapeType === 'triangle'}
            className='shadow-none'
          >
            <Triangle />
          </Button>
          <Button
            type='button'
            size='default'
            variant='outline'
            onClick={() => handleCreateShape('circle')}
            isActive={shapeType === 'circle'}
            className='shadow-none'
          >
            <Circle />
          </Button>
        </div>
      </div>

      <div className='flex w-full flex-col gap-2'>
        <h3 className='text-muted-foreground text-xs font-medium'>Fill Color</h3>
        <div className='flex flex-wrap items-center gap-3'>
          {EDITOR_COLORS.map((color) => (
            <Button
              type='button'
              key={color.value}
              className={cn(
                'h-6 w-6 cursor-pointer rounded-4xl border transition-all',
                shapeFillColor === color.hex && 'outline-primary outline-2'
              )}
              style={{ backgroundColor: color.value, borderColor: color.border }}
              onClick={() => handleShapeFillColorChange(color.hex)}
              title={color.label}
              aria-label={`${color.label} color`}
              isActive={shapeFillColor === color.hex}
            />
          ))}
          <button
            type='button'
            onClick={() => handleShapeFillColorChange(transparentColor)}
            className={cn(
              'h-6 w-6 cursor-pointer rounded-4xl border border-none transition-all',
              shapeFillColor === transparentColor && 'outline-primary outline-2'
            )}
          >
            <Ban size={24} className='text-muted-foreground' />
          </button>
        </div>
      </div>

      <div className='space-y-2'>
        <h3 className='text-muted-foreground text-xs font-medium'>Stroke Color</h3>
        <div className='flex flex-wrap items-center gap-3'>
          {EDITOR_COLORS.map((color) => (
            <Button
              type='button'
              key={color.value}
              className={cn(
                'h-6 w-6 cursor-pointer rounded-4xl border transition-all',
                shapeStrokeColor === color.hex && 'outline-primary outline-2'
              )}
              style={{ backgroundColor: color.value, borderColor: color.border }}
              onClick={() => handleShapeStrokeColorChange(color.hex)}
              title={color.label}
              aria-label={`${color.label} color`}
              isActive={shapeStrokeColor === color.hex}
            />
          ))}
          <button
            type='button'
            onClick={() => handleShapeStrokeColorChange(transparentColor)}
            className={cn(
              'h-6 w-6 cursor-pointer rounded-4xl border border-none transition-all',
              shapeStrokeColor === transparentColor && 'outline-primary outline-2'
            )}
          >
            <Ban size={24} className='text-muted-foreground' />
          </button>
        </div>
      </div>

      <div className='space-y-2'>
        <h3 className='text-muted-foreground text-xs font-medium'>Stroke Width</h3>
        <div className='flex items-center gap-3'>
          <Slider
            max={50}
            step={10}
            min={1}
            defaultValue={[shapeStroke]}
            onValueChange={(value: number[]) => {
              handleShapeStrokeChange(value[0]);
            }}
          />
          <span className='text-muted-foreground w-8 text-center text-xs'>{shapeStroke}</span>
        </div>
      </div>
    </div>
  );
}
