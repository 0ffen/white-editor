import { useCallback, useEffect, useState } from 'react';

export interface ImageDragState {
  isDragging: boolean;
  dragStart: { x: number; y: number } | null;
  dragOffset: { x: number; y: number };
}

export interface ImageDragHandlers {
  handleMouseDown: (e: React.MouseEvent) => void;
  setDragOffset: (offset: { x: number; y: number }) => void;
  resetDragOffset: () => void;
}

export interface UseImageDragOptions {
  zoomLevel: number;
  maxOffset?: number;
}

/**
 * @name useImageDrag
 * @description 이미지 드래그 기능을 제공하는 훅
 */
export function useImageDrag(options: UseImageDragOptions): ImageDragState & ImageDragHandlers {
  const { zoomLevel, maxOffset = 400 } = options;

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoomLevel > 100) {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    },
    [zoomLevel]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && dragStart) {
        e.preventDefault();
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        setDragOffset((prev) => {
          const newX = prev.x + deltaX;
          const newY = prev.y + deltaY;

          const constrainedX = Math.max(-maxOffset, Math.min(maxOffset, newX));
          const constrainedY = Math.max(-maxOffset, Math.min(maxOffset, newY));

          return {
            x: constrainedX,
            y: constrainedY,
          };
        });

        setDragStart({ x: e.clientX, y: e.clientY });
      }
    },
    [isDragging, dragStart, maxOffset]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  const resetDragOffset = useCallback(() => {
    setDragOffset({ x: 0, y: 0 });
  }, []);

  // 전역 마우스 이벤트 리스너 추가/제거
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return {
    isDragging,
    dragStart,
    dragOffset,
    handleMouseDown,
    setDragOffset,
    resetDragOffset,
  };
}
