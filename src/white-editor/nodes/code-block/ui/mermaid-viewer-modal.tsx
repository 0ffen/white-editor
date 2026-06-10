import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Button, TooltipProvider, getTranslate, usePortalContainer } from '@/shared';

import './mermaid-viewer-modal.css';

export type MermaidViewerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 렌더된 mermaid SVG 마크업 문자열 */
  svg: string;
};

/**
 * @name MermaidViewerModal
 * @description 조회(뷰어) 모드에서 mermaid 다이어그램 클릭 시 전체 화면으로 확대해 보여주는 모달 (줌, 드래그, 닫기)
 *
 * ImageViewerModal과 동일하게 Radix Dialog 대신 createPortal을 사용해
 * DismissableLayer의 document-level 이벤트 간섭 없이 안정적으로 동작한다.
 */
export const MermaidViewerModal: React.FC<MermaidViewerModalProps> = ({ open, onOpenChange, svg }) => {
  const portalContainer = usePortalContainer();
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, lastOffsetX: 0, lastOffsetY: 0 });
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

  const resetOffset = useCallback(() => {
    setDragOffset({ x: 0, y: 0 });
    dragRef.current.lastOffsetX = 0;
    dragRef.current.lastOffsetY = 0;
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 25, 500));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 25, 25);
      if (next <= 100) resetOffset();
      return next;
    });
  }, [resetOffset]);

  const handleDoubleClick = useCallback(() => {
    setZoomLevel((prev) => {
      if (prev === 100) return 200;
      resetOffset();
      return 100;
    });
  }, [resetOffset]);

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
      aria-label='View Diagram'
      className='we:fixed we:inset-0 we:z-modal we:flex we:flex-col we:overflow-hidden'
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className='we:absolute we:inset-0 we:bg-[var(--Neutral-Opacity-Light-40,rgba(22,22,22,0.4))]'
        aria-hidden='true'
      />

      <TooltipProvider>
        <div className='we:relative we:flex we:min-h-0 we:flex-1 we:flex-col we:items-center we:justify-center'>
          <div
            className='we:relative we:flex we:w-[90vw] we:flex-1 we:items-center we:justify-center we:overflow-hidden'
            onMouseDown={handleMouseDown}
            onClick={handleBackdropClick}
            style={{ cursor: zoomLevel > 100 ? (dragRef.current.isDragging ? 'grabbing' : 'grab') : 'default' }}
          >
            <div
              className='we-mermaid-modal-media we:flex we:w-full we:items-center we:justify-center we:rounded-sm we:bg-elevation-level1 we:py-10 we:transition-transform we:duration-200 we:select-none'
              style={{
                transform: `scale(${zoomLevel / 100}) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                transformOrigin: 'center center',
              }}
              onDoubleClick={handleDoubleClick}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>

          <div className='we:bg-elevation-opacity-2 we:text-text-inverse we:absolute we:bottom-2 we:left-1/2 we:flex we:w-fit we:flex-shrink-0 we:-translate-x-1/2 we:items-center we:justify-center we:gap-1 we:rounded-sm we:px-1 we:py-1'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='we:text-text-inverse'
              onClick={handleZoomOut}
              disabled={zoomLevel <= 25}
            >
              <Minus className='we:h-5 we:w-5' />
            </Button>
            <span className='we:text-text-inverse we:min-w-[3rem] we:text-center we:text-sm'>{zoomLevel}%</span>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='we:text-text-inverse'
              onClick={handleZoomIn}
              disabled={zoomLevel >= 500}
            >
              <Plus className='we:h-5 we:w-5' />
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='we:text-text-inverse we:ml-1'
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
