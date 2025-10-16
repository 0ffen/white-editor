import React, { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Check, Minus, Plus, RefreshCcw } from 'lucide-react';
import TuiImageEditor from 'tui-image-editor';
import { Button, Textarea } from '@/shared';
import { ImageEditorToolbar, CropEditor, DrawEditor, ShapeEditor, TextEditor } from '@/white-editor';
import { useImageZoom } from '@/white-editor/nodes/image/hook';
import type { default as TuiImageEditorType } from 'tui-image-editor';

export interface ImageEditorRef {
  getEditedImageAsBlob: () => Promise<Blob | null>;
  toDataURL: () => string | null;
}
interface ImageEditorProps {
  imageUrl: string;
  onCaptionChange?: (caption: string) => void;
  defaultCaption?: string;
  activeMode: string | null;
  setActiveMode: (mode: string | null) => void;
}

export const ImageEditor = forwardRef<ImageEditorRef, ImageEditorProps>((props, ref) => {
  const { imageUrl, onCaptionChange, defaultCaption = '', activeMode, setActiveMode } = props;

  const rootEl = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<TuiImageEditorType | null>(null);

  const [drawingColor, setDrawingColor] = useState<string>('#000000');
  const [drawingRange, setDrawingRange] = useState<number>(10);
  const [caption, setCaption] = useState<string>(defaultCaption);

  const { zoomLevel, handleZoomIn, handleZoomOut, handleZoomReset } = useImageZoom();

  // 확대/축소 시 TuiImageEditor 컨테이너에 CSS transform 적용
  useEffect(() => {
    if (rootEl.current) {
      const container = rootEl.current;
      const scale = zoomLevel / 100;

      container.style.transform = `scale(${scale})`;
      container.style.transformOrigin = 'center center';
      container.style.transition = 'transform 0.2s ease-in-out';
    }
  }, [zoomLevel]);

  useEffect(() => {
    if (rootEl.current) {
      const container = rootEl.current;

      const instance = new TuiImageEditor(container, {
        cssMaxWidth: 768,
        cssMaxHeight: 400,
        usageStatistics: false,
        selectionStyle: {
          cornerSize: 20,
          rotatingPointOffset: 70,
        },
      });

      editorRef.current = instance;

      instance.loadImageFromURL(imageUrl, 'UploadedImage').then(() => {
        // 초기 이미지 로드 후 undo 스택을 클리어하여 초기 상태가 undo되지 않도록 함
        setTimeout(() => {
          if (instance) {
            instance.clearUndoStack();
          }
        }, 100);
      });

      return () => {
        instance.destroy();
        editorRef.current = null;
      };
    }
  }, [imageUrl]);

  const startCropMode = useCallback(() => {
    if (!editorRef.current) return;
    editorRef.current.startDrawingMode('CROPPER');
  }, [editorRef]);

  const startDrawMode = useCallback(() => {
    if (!editorRef.current) return;
    editorRef.current.startDrawingMode('FREE_DRAWING', {
      width: drawingRange,
      color: drawingColor,
    });
  }, [editorRef, drawingRange, drawingColor]);

  const startShapeMode = useCallback(() => {
    if (!editorRef.current) return;
    editorRef.current.startDrawingMode('SHAPE');
    editorRef.current.setDrawingShape('rect', {
      fill: '#000000',
      stroke: '#000000',
      strokeWidth: 10,
    });
  }, [editorRef]);

  const handleModeChange = useCallback(
    (mode: string | null) => {
      setActiveMode?.(mode);
      editorRef.current?.stopDrawingMode();

      if (mode === 'draw') {
        startDrawMode();
      }
      if (mode === 'shape') {
        startShapeMode();
      }
      if (mode === 'crop') {
        startCropMode();
      }
    },
    [startCropMode, startDrawMode, startShapeMode, setActiveMode]
  );

  const handleCaptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newCaption = e.target.value;
      setCaption(newCaption);
      onCaptionChange?.(newCaption);
    },
    [onCaptionChange]
  );

  useImperativeHandle(
    ref,
    () => ({
      getEditedImageAsBlob: async (): Promise<Blob | null> => {
        if (!editorRef.current) return null;

        try {
          const dataURL = editorRef.current.toDataURL();
          const response = await fetch(dataURL);
          return await response.blob();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to get edited image as blob:', error);
          return null;
        }
      },
      toDataURL: (): string | null => {
        if (!editorRef.current) return null;

        try {
          return editorRef.current.toDataURL();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to get data URL:', error);
          return null;
        }
      },
    }),
    []
  );

  return (
    <div className='we:flex we:w-full we:flex-col'>
      {/* Toolbar */}
      <ImageEditorToolbar editorRef={editorRef} activeMode={activeMode} handleModeChange={handleModeChange} />
      {/* Image */}
      <div
        className='we:overflow-auto we:rounded we:bg-border/50 we:relative'
        style={{
          userSelect: 'none',
        }}
      >
        {/* 확대/축소 컨트롤 */}
        <div
          className='we:flex we:items-center we:gap-2 we:fixed we:top-30 we:left-10 we:bg-accent we:border we:rounded-lg we:z-10 we:w-fit'
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Button type='button' onClick={handleZoomOut} disabled={zoomLevel <= 50} size='sm'>
            <Minus />
          </Button>
          <span className='we:text-sm we:min-w-[50px] we:text-center'>{zoomLevel}%</span>
          <Button type='button' onClick={handleZoomIn} disabled={zoomLevel >= 200} size='sm'>
            <Plus />
          </Button>
          <Button type='button' onClick={handleZoomReset} className='we:h-fit we:w-fit'>
            <RefreshCcw />
          </Button>
        </div>

        <div
          ref={rootEl}
          className='we:flex we:h-[400px] we:w-full we:items-center we:justify-center we:rounded'
          style={{
            height: `${400 * (zoomLevel / 100)}px`,
          }}
        />
      </div>

      {!activeMode && (
        <div className='we:mx-auto we:mt-4 we:flex we:w-full we:flex-col we:space-y-4 we:p-2'>
          <div className='we:flex we:w-full we:flex-col we:space-y-2'>
            <h3 className='we:text-muted-foreground we:text-xs we:font-medium'>Caption</h3>
            <Textarea
              name='caption'
              value={caption}
              onChange={handleCaptionChange}
              rows={3}
              className='we:resize-none'
            />
          </div>
        </div>
      )}
      {/* Editor Options */}
      {activeMode && (
        <div className='we:mx-auto we:mt-4 we:w-full'>
          {activeMode === 'crop' && <CropEditor editorRef={editorRef} setActiveMode={setActiveMode} />}
          {activeMode === 'text' && <TextEditor editorRef={editorRef} />}
          {activeMode === 'draw' && (
            <DrawEditor
              drawingColor={drawingColor}
              setDrawingColor={setDrawingColor}
              drawingRange={drawingRange}
              editorRef={editorRef}
              activeMode={activeMode}
              setDrawingRange={setDrawingRange}
            />
          )}
          {activeMode === 'shape' && <ShapeEditor editorRef={editorRef} />}
          {activeMode !== 'crop' && (
            <div className='we:mt-4 we:flex we:justify-center we:items-center'>
              <Button
                className='we:w-fit we:pl-4 we:pr-6 we:rounded-4xl'
                type='button'
                variant='default'
                onClick={() => {
                  editorRef.current?.stopDrawingMode();
                  setActiveMode(null);
                }}
              >
                <Check /> Done
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

ImageEditor.displayName = 'ImageEditor';
