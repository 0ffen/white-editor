import { useCallback, useEffect } from 'react';
import type { default as TuiImageEditorType } from 'tui-image-editor';

interface CropEditorProps {
  editorRef: React.RefObject<TuiImageEditorType | null>;
  setActiveMode: (mode: string | null) => void;
  /** 푸터 적용/취소 핸들러 등록 (푸터는 ImageEditor에서 full width로 렌더) */
  onRegisterApply?: (fn: () => void | Promise<void>) => void;
  onRegisterCancel?: (fn: () => void) => void;
}

export function CropEditor(props: CropEditorProps) {
  const { editorRef, setActiveMode, onRegisterApply, onRegisterCancel } = props;

  const applyCrop = useCallback(async () => {
    if (!editorRef.current) return;
    await editorRef.current.crop(editorRef.current.getCropzoneRect());
    editorRef.current.stopDrawingMode();
    setActiveMode(null);
  }, [editorRef, setActiveMode]);

  const stopCropMode = useCallback(() => {
    editorRef.current?.stopDrawingMode();
    setActiveMode(null);
  }, [editorRef, setActiveMode]);

  useEffect(() => {
    onRegisterApply?.(applyCrop);
    onRegisterCancel?.(stopCropMode);
  }, [onRegisterApply, onRegisterCancel, applyCrop, stopCropMode]);

  return null;
}
