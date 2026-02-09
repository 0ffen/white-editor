import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Minus, Plus, Download, X } from 'lucide-react';
import { Button, Dialog, DialogContent, DialogTitle, Separator, TooltipProvider, getTranslate } from '@/shared';
import { downloadImage } from '../../util';

export type ImageViewerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  alt?: string;
  title?: string;
};

/**
 * @name ImageViewerModal
 * @description 조회 모드에서 이미지 클릭 시 전체 화면으로 보여주는 모달 (줌, 드래그, 다운로드, 닫기)
 */
export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ open, onOpenChange, src, alt, title }) => {
  const dialogImageRef = useRef<HTMLImageElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => {
      const newZoom = Math.min(prev + 25, 500);
      if (newZoom > 100 && prev <= 100) {
        setDragOffset({ x: 0, y: 0 });
      }
      return newZoom;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => {
      const newZoom = Math.max(prev - 25, 25);
      if (newZoom <= 100) {
        setDragOffset({ x: 0, y: 0 });
      }
      return newZoom;
    });
  }, []);

  const handleImageDoubleClick = useCallback(() => {
    setZoomLevel((prev) => {
      if (prev === 100) return 200;
      setDragOffset({ x: 0, y: 0 });
      return 100;
    });
  }, []);

  const handleDownload = useCallback(() => {
    if (src) downloadImage(src);
  }, [src]);

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
          const maxOffset = 400;
          const constrainedX = Math.max(-maxOffset, Math.min(maxOffset, newX));
          const constrainedY = Math.max(-maxOffset, Math.min(maxOffset, newY));
          return { x: constrainedX, y: constrainedY };
        });

        setDragStart({ x: e.clientX, y: e.clientY });
      }
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

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

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setZoomLevel(100);
        setDragOffset({ x: 0, y: 0 });
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange]
  );

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTitle className='we:sr-only'>View Image</DialogTitle>
      <DialogContent
        hideCloseButton
        className='we:bg-transparent we:shadow-none we:p-0 we:max-w-none we:w-full we:h-full we:min-h-[100dvh] we:top-0 we:left-0 we:translate-x-0 we:translate-y-0 we:rounded-none we:flex we:flex-col we:overflow-hidden'
      >
        <TooltipProvider>
          <div className='we:flex we:flex-1 we:min-h-0 we:flex-col we:items-center we:justify-center'>
            <div
              className='we:relative we:flex we:flex-1 we:w-full we:items-center we:justify-center we:overflow-hidden'
              onMouseDown={handleMouseDown}
              style={{ cursor: zoomLevel > 100 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            >
              <img
                ref={dialogImageRef}
                src={src}
                alt={alt}
                title={title}
                className='we:max-h-[calc(100dvh-80px)] we:max-w-full we:object-contain we:transition-transform we:duration-200 we:select-none'
                style={{
                  transform: `scale(${zoomLevel / 100}) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                  transformOrigin: 'center center',
                }}
                onDoubleClick={handleImageDoubleClick}
              />
            </div>

            {/* 하단 툴바: -, 100%, +, 다운로드, 닫기 */}
            <div className='we:flex we:w-fit we:flex-shrink-0 we:absolute we:bottom-2 we:left-1/2 we:-translate-x-1/2 we:items-center we:justify-center we:gap-1 we:rounded-sm we:py-1 we:px-1 we:bg-elevation-opacity-2 we:text-text-inverse'>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='we:text-text-inverse'
                onClick={handleZoomOut}
                disabled={zoomLevel <= 50}
              >
                <Minus className='we:h-5 we:w-5' />
              </Button>
              <span className='we:min-w-[3rem] we:text-center we:text-sm we:text-text-inverse'>{zoomLevel}%</span>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='we:text-text-inverse'
                onClick={handleZoomIn}
                disabled={zoomLevel >= 200}
              >
                <Plus className='we:h-5 we:w-5' />
              </Button>
              <Separator orientation='vertical' className='we:h-4! we:mx-2 we:bg-border-color' />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='we:text-text-inverse'
                onClick={handleDownload}
                tooltip={getTranslate('다운로드')}
              >
                <Download className='we:h-5 we:w-5' />
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='we:ml-1 we:text-text-inverse'
                onClick={() => onOpenChange(false)}
                tooltip={getTranslate('닫기')}
              >
                <X className='we:h-5 we:w-5' />
              </Button>
            </div>
          </div>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
};
