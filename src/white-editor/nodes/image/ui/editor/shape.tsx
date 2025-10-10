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
  const [shapeType, setShapeType] = useState<string | null>('rect');
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
    <div className='we:flex we:w-full we:flex-col we:gap-4 we:space-y-2 we:p-2'>
      <div className='we:flex we:w-full we:flex-col we:gap-2'>
        <h3 className='we:text-muted-foreground we:w-fit we:text-xs we:font-medium'>Shape</h3>
        <div className='we:flex we:items-center we:justify-center we:gap-2'>
          <Button
            type='button'
            size='default'
            variant='outline'
            onClick={() => handleCreateShape('rect')}
            isActive={shapeType === 'rect'}
            className='we:shadow-none'
          >
            <Square className='size-6' />
          </Button>
          <Button
            type='button'
            size='default'
            variant='outline'
            onClick={() => handleCreateShape('triangle')}
            isActive={shapeType === 'triangle'}
            className='we:shadow-none'
          >
            <Triangle />
          </Button>
          <Button
            type='button'
            size='default'
            variant='outline'
            onClick={() => handleCreateShape('circle')}
            isActive={shapeType === 'circle'}
            className='we:shadow-none'
          >
            <Circle />
          </Button>
        </div>
      </div>

      <div className='we:flex we:w-full we:flex-col we:gap-2'>
        <h3 className='we:text-muted-foreground we:text-xs we:font-medium'>Fill Color</h3>
        <div className='we:flex we:flex-wrap we:items-center we:gap-3'>
          {EDITOR_COLORS.map((color) => (
            <Button
              type='button'
              key={color.value}
              className={cn(
                'we:h-6 we:w-6 we:cursor-pointer we:rounded-4xl we:border we:transition-all',
                shapeFillColor === color.hex && 'we:ring-2 we:ring-blue-500 we:ring-offset-0'
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
              'we:h-6 we:w-6 we:cursor-pointer we:rounded-4xl we:border we:border-none we:transition-all',
              shapeFillColor === transparentColor && 'we:ring-2 we:ring-blue-500 we:ring-offset-0'
            )}
          >
            <Ban size={24} className='we:text-muted-foreground' />
          </button>
        </div>
      </div>

      <div className='we:space-y-2'>
        <h3 className='we:text-muted-foreground we:text-xs we:font-medium'>Stroke Color</h3>
        <div className='we:flex we:flex-wrap we:items-center we:gap-3'>
          {EDITOR_COLORS.map((color) => (
            <Button
              type='button'
              key={color.value}
              className={cn(
                'we:h-6 we:w-6 we:cursor-pointer we:rounded-4xl we:border we:transition-all',
                shapeStrokeColor === color.hex && 'we:ring-2 we:ring-blue-500 we:ring-offset-0'
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
              'we:h-6 we:w-6 we:cursor-pointer we:rounded-4xl we:border we:border-none we:transition-all',
              shapeStrokeColor === transparentColor && 'we:ring-2 we:ring-blue-500 we:ring-offset-0'
            )}
          >
            <Ban size={24} className='we:text-muted-foreground' />
          </button>
        </div>
      </div>

      <div className='we:space-y-2'>
        <h3 className='we:text-muted-foreground we:text-xs we:font-medium'>Stroke Width</h3>
        <div className='we:flex we:items-center we:gap-3'>
          <Slider
            max={50}
            step={10}
            min={1}
            defaultValue={[shapeStroke]}
            onValueChange={(value: number[]) => {
              handleShapeStrokeChange(value[0]);
            }}
          />
          <span className='we:text-muted-foreground we:w-8 we:text-center we:text-xs'>{shapeStroke}</span>
        </div>
      </div>
    </div>
  );
}
