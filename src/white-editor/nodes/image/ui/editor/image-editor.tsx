import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';

import TuiImageEditor from 'tui-image-editor';
import { Button } from '@/shared';
import { base64ToBlob } from '@/shared/utils/base64-to-blob';
import { CropEditor, DrawEditor, ImageEditorFooter, ImageEditorToolbar, ShapeEditor, TextEditor } from '@/white-editor';
import { useImageZoom } from '@/white-editor/nodes/image/hook';
import type { default as TuiImageEditorType } from 'tui-image-editor';

export interface ImageEditorRef {
  getEditedImageAsBlob: () => Promise<Blob | null>;
  toDataURL: () => string | null;
}
interface ImageEditorProps {
  imageUrl: string;
  activeMode: string | null;
  setActiveMode: (mode: string | null) => void;
}

export const ImageEditor = forwardRef<ImageEditorRef, ImageEditorProps>((props, ref) => {
  const { imageUrl, activeMode, setActiveMode } = props;

  const rootEl = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<TuiImageEditorType | null>(null);
  const editorApplyRef = useRef<() => void | Promise<void>>(null);
  const editorCancelRef = useRef<() => void>(null);
  /** 모드 진입 시점 캔버스 스냅샷. 취소 시 이 상태로 복원하여 해당 모드에서 추가한 요소만 제거 */
  const modeEnterSnapshotRef = useRef<string | null>(null);

  const [drawingColor, setDrawingColor] = useState<string>('#161616');
  const [drawingRange, setDrawingRange] = useState<number>(10);

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
          cornerSize: 10,
          rotatingPointOffset: 10,
          borderColor: 'var(--we-white)',
          lineWidth: 1,
          cornerColor: 'var(--we-white)',
          cornerStrokeColor: 'var(--we-black)',
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

  // 텍스트/도형/그리기 모드 진입 시 캔버스 스냅샷 저장 → 취소 시 이 상태로 복원
  useEffect(() => {
    if (activeMode === 'text' || activeMode === 'draw' || activeMode === 'shape') {
      if (editorRef.current) {
        modeEnterSnapshotRef.current = editorRef.current.toDataURL();
      }
    } else {
      modeEnterSnapshotRef.current = null;
    }
  }, [activeMode]);

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
    <div className='white-editor we:flex we:w-full we:flex-col'>
      {/* Toolbar */}
      <div className='we:px-4 we:flex we:justify-between we:items-center'>
        <ImageEditorToolbar editorRef={editorRef} activeMode={activeMode} handleModeChange={handleModeChange} />

        {/* 확대/축소 컨트롤 */}
        <div className='we:flex we:items-center we:gap-1 we:w-fit' onMouseDown={(e) => e.stopPropagation()}>
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
      </div>

      {/* Image */}
      <div
        className='we:overflow-auto we:rounded we:bg-elevation-level1 we:relative we:h-[420px] we:w-full we:grid we:place-items-center'
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

      {/* Editor Options (패딩 영역) */}
      {activeMode && (
        <div className='we:mx-auto we:w-full we:px-4'>
          {activeMode === 'crop' && (
            <CropEditor
              editorRef={editorRef}
              setActiveMode={setActiveMode}
              onRegisterApply={(fn) => {
                editorApplyRef.current = fn;
              }}
              onRegisterCancel={(fn) => {
                editorCancelRef.current = fn;
              }}
            />
          )}
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

      {activeMode && (
        <ImageEditorFooter
          showBorderTop={activeMode !== 'crop'}
          onCancel={() => {
            if (activeMode === 'crop') {
              editorCancelRef.current?.();
              return;
            }
            // 텍스트/도형/그리기: 모드 진입 전 상태로 복원 후 모드 해제
            const snapshot = modeEnterSnapshotRef.current;
            if (
              (activeMode === 'text' || activeMode === 'draw' || activeMode === 'shape') &&
              editorRef.current &&
              snapshot
            ) {
              editorRef.current
                .loadImageFromURL(snapshot, 'UploadedImage')
                .then(() => {
                  editorRef.current?.stopDrawingMode();
                  setActiveMode(null);
                  setTimeout(() => editorRef.current?.clearUndoStack(), 100);
                })
                .catch(() => {
                  editorRef.current?.discardSelection();
                  editorRef.current?.stopDrawingMode();
                  setActiveMode(null);
                });
            } else {
              editorRef.current?.discardSelection();
              editorRef.current?.stopDrawingMode();
              setActiveMode(null);
            }
          }}
          onApply={() => {
            if (activeMode === 'crop') editorApplyRef.current?.();
            else {
              editorRef.current?.discardSelection();
              editorRef.current?.stopDrawingMode();
              setActiveMode(null);
            }
          }}
        />
      )}
    </div>
  );
});

ImageEditor.displayName = 'ImageEditor';
