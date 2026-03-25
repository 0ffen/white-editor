import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Minus, Plus, Download, X } from 'lucide-react';
import { Button, Separator, TooltipProvider, getTranslate, usePortalContainer } from '@/shared';
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
 *
 * Radix Dialog 대신 createPortal을 사용하여 열기/닫기 시
 * DismissableLayer의 document-level 이벤트 간섭 없이 안정적으로 동작합니다.
 */
export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ open, onOpenChange, src, alt, title }) => {
  const portalContainer = usePortalContainer();
  const dialogImageRef = useRef<HTMLImageElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    lastOffsetX: 0,
    lastOffsetY: 0,
  });
  const zoomRef = useRef(zoomLevel);
  zoomRef.current = zoomLevel;

  useEffect(() => {
    if (!open) {
      setZoomLevel(100);
      setDragOffset({ x: 0, y: 0 });
      dragRef.current = { isDragging: false, startX: 0, startY: 0, lastOffsetX: 0, lastOffsetY: 0 };
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => {
      const newZoom = Math.min(prev + 25, 500);
      if (newZoom > 100 && prev <= 100) {
        setDragOffset({ x: 0, y: 0 });
        dragRef.current.lastOffsetX = 0;
        dragRef.current.lastOffsetY = 0;
      }
      return newZoom;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => {
      const newZoom = Math.max(prev - 25, 25);
      if (newZoom <= 100) {
        setDragOffset({ x: 0, y: 0 });
        dragRef.current.lastOffsetX = 0;
        dragRef.current.lastOffsetY = 0;
      }
      return newZoom;
    });
  }, []);

  const handleImageDoubleClick = useCallback(() => {
    setZoomLevel((prev) => {
      if (prev === 100) return 200;
      setDragOffset({ x: 0, y: 0 });
      dragRef.current.lastOffsetX = 0;
      dragRef.current.lastOffsetY = 0;
      return 100;
    });
  }, []);

  const handleDownload = useCallback(() => {
    if (src) downloadImage(src);
  }, [src]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoomRef.current > 100) {
      e.preventDefault();
      const d = dragRef.current;
      d.isDragging = true;
      d.startX = e.clientX;
      d.startY = e.clientY;
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleMouseMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d.isDragging) return;
      e.preventDefault();

      const deltaX = e.clientX - d.startX;
      const deltaY = e.clientY - d.startY;
      d.startX = e.clientX;
      d.startY = e.clientY;

      const maxOffset = 400;
      d.lastOffsetX = Math.max(-maxOffset, Math.min(maxOffset, d.lastOffsetX + deltaX));
      d.lastOffsetY = Math.max(-maxOffset, Math.min(maxOffset, d.lastOffsetY + deltaY));

      setDragOffset({ x: d.lastOffsetX, y: d.lastOffsetY });
    };

    const handleMouseUp = () => {
      dragRef.current.isDragging = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [open]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onOpenChange(false);
      }
    },
    [onOpenChange]
  );

  if (!open) return null;

  const content = (
    <div
      role='dialog'
      aria-modal='true'
      aria-label='View Image'
      className='we:fixed we:inset-0 we:z-floating we:flex we:flex-col we:overflow-hidden'
    >
      <div
        className='we:absolute we:inset-0 we:bg-[var(--Neutral-Opacity-Light-40,rgba(22,22,22,0.4))]'
        aria-hidden='true'
      />

      <TooltipProvider>
        <div className='we:relative we:flex we:flex-1 we:min-h-0 we:flex-col we:items-center we:justify-center'>
          <div
            className='we:relative we:flex we:flex-1 we:w-full we:items-center we:justify-center we:overflow-hidden'
            onMouseDown={handleMouseDown}
            onClick={handleBackdropClick}
            style={{ cursor: zoomLevel > 100 ? (dragRef.current.isDragging ? 'grabbing' : 'grab') : 'default' }}
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
    </div>
  );

  return createPortal(content, portalContainer || document.body);
};
