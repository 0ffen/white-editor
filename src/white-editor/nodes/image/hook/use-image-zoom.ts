import { useCallback, useState } from 'react';

export interface ImageZoomState {
  zoomLevel: number;
}

export interface ImageZoomHandlers {
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleZoomReset: () => void;
  setZoomLevel: (level: number) => void;
}

export interface UseImageZoomOptions {
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  onZoomChange?: (zoomLevel: number) => void;
}

/**
 * @name useImageZoom
 * @description 이미지 확대/축소 기능을 제공하는 훅
 */
export function useImageZoom(options: UseImageZoomOptions = {}): ImageZoomState & ImageZoomHandlers {
  const { initialZoom = 100, minZoom = 25, maxZoom = 500, zoomStep = 25, onZoomChange } = options;

  const [zoomLevel, setZoomLevelState] = useState<number>(initialZoom);

  const setZoomLevel = useCallback(
    (level: number) => {
      const constrainedLevel = Math.max(minZoom, Math.min(maxZoom, level));
      setZoomLevelState(constrainedLevel);
      onZoomChange?.(constrainedLevel);
    },
    [minZoom, maxZoom, onZoomChange]
  );

  const handleZoomIn = useCallback(() => {
    setZoomLevel(zoomLevel + zoomStep);
  }, [zoomLevel, zoomStep, setZoomLevel]);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(zoomLevel - zoomStep);
  }, [zoomLevel, zoomStep, setZoomLevel]);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(initialZoom);
  }, [initialZoom, setZoomLevel]);

  return {
    zoomLevel,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    setZoomLevel,
  };
}
