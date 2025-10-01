import React, { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import TuiImageEditor from 'tui-image-editor';
import { Textarea } from '@/shared';
import { ImageEditorToolbar, CropEditor, DrawEditor, ShapeEditor, TextEditor } from '@/white-editor';
import type { default as TuiImageEditorType } from 'tui-image-editor';

export interface ImageEditorRef {
  getEditedImageAsBlob: () => Promise<Blob | null>;
  toDataURL: () => string | null;
}
interface ImageEditorProps {
  imageUrl: string;
  onCaptionChange?: (caption: string) => void;
  defaultCaption?: string;
}

export const ImageEditor = forwardRef<ImageEditorRef, ImageEditorProps>((props, ref) => {
  const { imageUrl, onCaptionChange, defaultCaption = '' } = props;

  const rootEl = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<TuiImageEditorType | null>(null);

  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [drawingColor, setDrawingColor] = useState<string>('#000000');
  const [drawingRange, setDrawingRange] = useState<number>(10);
  const [caption, setCaption] = useState<string>(defaultCaption);

  useEffect(() => {
    if (rootEl.current) {
      const container = rootEl.current;
      const containerWidth = container.clientWidth || 800;
      const containerHeight = container.clientHeight || 350;

      const instance = new TuiImageEditor(container, {
        cssMaxWidth: containerWidth,
        cssMaxHeight: containerHeight,
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
          instance.clearUndoStack();
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

  const handleModeChange = useCallback(
    (mode: string | null) => {
      setActiveMode(mode);
      editorRef.current?.stopDrawingMode();

      if (mode === 'draw') {
        startDrawMode();
      }
      if (mode === 'crop') {
        startCropMode();
      }
    },
    [startCropMode, startDrawMode]
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
    <div className='flex w-full flex-col'>
      {/* Toolbar */}
      <ImageEditorToolbar editorRef={editorRef} activeMode={activeMode} handleModeChange={handleModeChange} />
      {/* Image */}
      <div ref={rootEl} className='bg-border flex h-[300px] w-full items-center justify-center rounded' />
      {!activeMode && (
        <div className='mx-auto mt-4 flex w-full flex-col space-y-4 p-2'>
          <div className='flex w-full flex-col space-y-2'>
            <h3 className='text-muted-foreground text-xs font-medium'>Caption</h3>
            <Textarea name='caption' value={caption} onChange={handleCaptionChange} rows={3} className='resize-none' />
          </div>
        </div>
      )}
      {/* Editor Options */}
      {activeMode && (
        <div className='mx-auto mt-4 w-full'>
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
        </div>
      )}
    </div>
  );
});

ImageEditor.displayName = 'ImageEditor';
