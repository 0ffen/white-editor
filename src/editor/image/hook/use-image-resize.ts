import { useState, useCallback, useRef } from 'react';

export interface ImageResizeOptions {
  initialWidth?: string;
  initialHeight?: string;
  minWidth?: number;
  minHeight?: number;
  onResize?: (width: string, height: string) => void;
}

export interface ImageResizeState {
  currentWidth: string;
  currentHeight: string;
  isResizing: boolean;
}

export interface ImageResizeHandlers {
  handleResizeStart: (e: React.MouseEvent) => void;
  setCurrentWidth: (width: string) => void;
  setCurrentHeight: (height: string) => void;
}

export function useImageResize(options: ImageResizeOptions = {}) {
  const { initialWidth = 'auto', initialHeight = 'auto', minWidth = 50, minHeight = 50, onResize } = options;

  const [currentWidth, setCurrentWidth] = useState(initialWidth);
  const [currentHeight, setCurrentHeight] = useState(initialHeight);
  const [isResizing, setIsResizing] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!imageRef.current) return;

      setIsResizing(true);

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = imageRef.current.offsetWidth;
      const startHeight = imageRef.current.offsetHeight;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        const newWidth = Math.max(minWidth, startWidth + deltaX);
        const newHeight = Math.max(minHeight, startHeight + deltaY);

        const widthPx = `${newWidth}px`;
        const heightPx = `${newHeight}px`;

        setCurrentWidth(widthPx);
        setCurrentHeight(heightPx);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        onResize?.(currentWidth, currentHeight);

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [currentWidth, currentHeight, minWidth, minHeight, onResize]
  );

  const resizeState: ImageResizeState = {
    currentWidth,
    currentHeight,
    isResizing,
  };

  const resizeHandlers: ImageResizeHandlers = {
    handleResizeStart,
    setCurrentWidth,
    setCurrentHeight,
  };

  return {
    imageRef,
    resizeState,
    resizeHandlers,
  };
}
