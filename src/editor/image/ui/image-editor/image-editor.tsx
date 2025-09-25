import { useCallback, useEffect, useRef, useState } from 'react';
import TuiImageEditor from 'tui-image-editor';
import { ImageEditorToolbar, CropEditor, DrawEditor, ShapeEditor, TextEditor } from '@/editor';
import type { default as TuiImageEditorType } from 'tui-image-editor';

interface ImageEditorProps {
  imageUrl: string;
}

export function ImageEditor({ imageUrl }: ImageEditorProps) {
  const rootEl = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<TuiImageEditorType | null>(null);

  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [drawingColor, setDrawingColor] = useState<string>('#000000');
  const [drawingRange, setDrawingRange] = useState<number>(10);

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

      instance.loadImageFromURL(imageUrl, 'UploadedImage').then(() => {});

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

  return (
    <div className='flex w-full flex-col'>
      {/* Toolbar */}
      <ImageEditorToolbar editorRef={editorRef} activeMode={activeMode} handleModeChange={handleModeChange} />
      {/* Image */}
      <div ref={rootEl} className='bg-muted flex h-[300px] w-full items-center justify-center rounded' />
      {/* Editor Options */}
      {activeMode && (
        <div className='mx-auto mt-6 w-full rounded-lg'>
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
}
