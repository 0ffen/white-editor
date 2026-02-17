import { useCallback, useEffect, useState } from 'react';
import { Ban, Circle, Square, Triangle } from 'lucide-react';
import { Button, cn, useTranslate, Slider } from '@/shared';
import { EDITOR_COLORS } from '@/white-editor';
import type { default as TuiImageEditorType } from 'tui-image-editor';

interface ShapeEditorProps {
  editorRef: React.RefObject<TuiImageEditorType | null>;
}

const transparentColor = '#ffffff00';
/** EDITOR_COLORS[0].editorHex와 동일. 모듈 로드 순서 이슈로 상수 사용 */
const DEFAULT_SHAPE_COLOR = '#161616';

export function ShapeEditor(props: ShapeEditorProps) {
  const { editorRef } = props;
  const t = useTranslate();

  const [shapeFillColor, setShapeFillColor] = useState<string>(DEFAULT_SHAPE_COLOR);
  const [shapeStrokeColor, setShapeStrokeColor] = useState<string>(DEFAULT_SHAPE_COLOR);
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
    <div className='we:flex we:w-full we:flex-col we:gap-2 we:space-y-2 we:p-2 we:mt-2'>
      <div className='we:flex we:w-full we:gap-2'>
        <div className='we:flex we:w-full we:gap-3 we:h-full we:items-center'>
          <h3 className='we:text-text-normal we:w-fit we:text-sm we:min-w-[72px]'>{t('도형')}</h3>
          <div className='we:flex we:items-center we:justify-center we:gap-2'>
            <Button
              type='button'
              variant='ghost'
              onClick={() => handleCreateShape('rect')}
              isActive={shapeType === 'rect'}
              className='we:shadow-none we:data-[active=true]:bg-transparent we:data-[active=true]:text-brand-default we:data-[active=true]:[&_svg]:text-brand-default'
            >
              <div
                className={cn(
                  'we:flex we:items-center we:justify-center we:gap-1',
                  shapeType === 'rect' ? 'we:text-brand-default' : 'we:text-text-light'
                )}
              >
                <Square size={20} color={shapeType === 'rect' ? 'var(--we-brand-default)' : 'var(--we-text-light)'} />
                {t('사각형')}
              </div>
            </Button>
            <Button
              type='button'
              variant='ghost'
              onClick={() => handleCreateShape('triangle')}
              isActive={shapeType === 'triangle'}
              className='we:shadow-none we:data-[active=true]:bg-transparent we:data-[active=true]:text-brand-default we:data-[active=true]:[&_svg]:text-brand-default'
            >
              <div
                className={cn(
                  'we:flex we:items-center we:justify-center we:gap-1',
                  shapeType === 'triangle' ? 'we:text-brand-default' : 'we:text-text-light'
                )}
              >
                <Triangle
                  size={20}
                  color={shapeType === 'triangle' ? 'var(--we-brand-default)' : 'var(--we-text-light)'}
                />
                {t('삼각형')}
              </div>
            </Button>
            <Button
              type='button'
              variant='ghost'
              onClick={() => handleCreateShape('circle')}
              isActive={shapeType === 'circle'}
              className='we:shadow-none we:data-[active=true]:bg-transparent we:data-[active=true]:text-brand-default we:data-[active=true]:[&_svg]:text-brand-default'
            >
              <div
                className={cn(
                  'we:flex we:items-center we:justify-center we:gap-1',
                  shapeType === 'circle' ? 'we:text-brand-default' : 'we:text-text-light'
                )}
              >
                <Circle size={20} color={shapeType === 'circle' ? 'var(--we-brand-default)' : 'var(--we-text-light)'} />
                {t('원형')}
              </div>
            </Button>
          </div>
        </div>
        <div className='we:space-y-2 we:flex we:w-full we:gap-3 we:justify-between we:items-center'>
          <h3 className='we:text-text-normal we:text-sm we:m-0! we:min-w-[80px]'>{t('두께')}</h3>
          <div className='we:flex we:w-full we:items-center we:gap-3 we:py-2'>
            <Slider
              max={50}
              step={1}
              min={1}
              defaultValue={[shapeStroke]}
              onValueChange={(value: number[]) => {
                handleShapeStrokeChange(value[0]);
              }}
            />
            <span className='we:text-text-light we:w-8 we:text-center we:text-sm'>{shapeStroke}</span>
          </div>
        </div>
      </div>

      <div className='we:flex we:w-full we:gap-2'>
        <div className='we:flex we:w-full we:gap-2 we:items-center'>
          <h3 className='we:text-text-normal we:text-sm we:m-0! we:min-w-[80px]'>{t('도형 색상')}</h3>
          <div className='we:flex we:flex-wrap we:items-center we:gap-1'>
            {EDITOR_COLORS.map((color) => (
              <Button
                type='button'
                size='icon'
                key={color.value}
                className={cn(
                  'we:h-6 we:w-6 we:cursor-pointer we:rounded-4xl we:border we:transition-all we:m-1',
                  shapeFillColor === color.editorHex && 'we:ring-2 we:ring-brand-default we:ring-offset-1'
                )}
                style={{ backgroundColor: color.value, borderColor: color.border }}
                onClick={() => handleShapeFillColorChange(color.editorHex)}
                title={color.label}
                aria-label={`${color.label} color`}
                isActive={shapeFillColor === color.editorHex}
              />
            ))}
            <button
              type='button'
              onClick={() => handleShapeFillColorChange(transparentColor)}
              className={cn(
                'we:h-6 we:w-6 we:cursor-pointer we:rounded-4xl we:border we:border-none we:transition-all we:m-1',
                shapeFillColor === transparentColor && 'we:ring-2 we:ring-brand-default we:ring-offset-1'
              )}
            >
              <Ban size={24} className='we:text-text-light' />
            </button>
          </div>
        </div>

        <div className='we:flex we:w-full we:gap-2 we:items-center'>
          <h3 className='we:text-text-normal we:text-sm we:m-0! we:min-w-[80px]'>{t('도형 획')}</h3>
          <div className='we:flex we:flex-wrap we:items-center we:gap-1'>
            {EDITOR_COLORS.map((color) => (
              <Button
                type='button'
                size='icon'
                key={color.value}
                className={cn(
                  'we:h-6 we:w-6 we:cursor-pointer we:rounded-4xl we:border we:transition-all we:m-1',
                  shapeStrokeColor === color.editorHex && 'we:ring-2 we:ring-brand-default we:ring-offset-1'
                )}
                style={{ backgroundColor: color.value, borderColor: color.border }}
                onClick={() => handleShapeStrokeColorChange(color.editorHex)}
                title={color.label}
                aria-label={`${color.label} color`}
                isActive={shapeStrokeColor === color.editorHex}
              />
            ))}
            <button
              type='button'
              onClick={() => handleShapeStrokeColorChange(transparentColor)}
              className={cn(
                'we:h-6 we:w-6 we:cursor-pointer we:rounded-4xl we:border we:border-none we:transition-all we:m-1',
                shapeStrokeColor === transparentColor && 'we:ring-2 we:ring-brand-default we:ring-offset-1'
              )}
            >
              <Ban size={24} className='we:text-text-light' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
