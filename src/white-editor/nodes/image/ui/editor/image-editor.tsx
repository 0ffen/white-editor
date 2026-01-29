import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';

import TuiImageEditor from 'tui-image-editor';
import { Button, Textarea } from '@/shared';
import { base64ToBlob } from '@/shared/utils/base64-to-blob';
import { CropEditor, DrawEditor, ImageEditorToolbar, ShapeEditor, TextEditor } from '@/white-editor';
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
  const BASE_WIDTH = 720;
  const BASE_HEIGHT = 400;
  const scale = zoomLevel / 100;

  useEffect(() => {
    if (rootEl.current) {
      const container = rootEl.current;

      const instance = new TuiImageEditor(container, {
        cssMaxWidth: BASE_WIDTH,
        cssMaxHeight: BASE_HEIGHT,
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
          const blobData = base64ToBlob(dataURL);
          return blobData;
        } catch {
          return null;
        }
      },
      toDataURL: (): string | null => {
        if (!editorRef.current) return null;
        return editorRef.current.toDataURL();
      },
    }),
    []
  );

  return (
    <div className='we:flex we:w-full we:flex-col'>
      {/* Toolbar */}
      <ImageEditorToolbar editorRef={editorRef} activeMode={activeMode} handleModeChange={handleModeChange} />

      {/* 확대/축소 컨트롤 */}
      <div
        className='we:flex we:items-center we:gap-1 we:fixed we:top-15 we:right-6 we:bg-background we:rounded-lg we:z-10 we:w-fit'
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Button type='button' onClick={handleZoomOut} disabled={zoomLevel <= 50}>
          <Minus />
        </Button>
        <Button type='button' onClick={handleZoomReset} className='we:min-w-[50px]'>
          {zoomLevel}%
        </Button>
        <Button type='button' onClick={handleZoomIn} disabled={zoomLevel >= 500}>
          <Plus />
        </Button>
      </div>

      {/* Image */}
      <div
        className='we:overflow-auto we:rounded we:bg-border/50 we:relative we:h-[420px] we:w-full we:grid we:place-items-center'
        style={{
          userSelect: 'none',
        }}
      >
        <div
          className='we:flex we:items-center we:justify-center'
          style={{
            width: `${BASE_WIDTH * scale}px`,
            height: `${BASE_HEIGHT * scale}px`,
            transition: 'width 0.2s ease-in-out, height 0.2s ease-in-out',
          }}
        >
          <div
            ref={rootEl}
            className='we:flex we:items-center we:justify-center we:rounded'
            style={{
              width: `${BASE_WIDTH}px`,
              height: `${BASE_HEIGHT}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
            }}
          />
        </div>
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
