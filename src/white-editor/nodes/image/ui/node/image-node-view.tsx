import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Minus, Plus, RefreshCcw } from 'lucide-react';
import { Button, Dialog, DialogContent, DialogTitle, cn } from '@/shared';
import {
  ImageCaption,
  ImageEditDialog,
  ImageFloatingControls,
  useImageEdit,
  useImageHover,
  useImageResize,
} from '@/white-editor';

import type { NodeViewProps } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';

type AlignType = 'left' | 'center' | 'right';

/**
 * @name ImageNodeView
 * @description Editor 내에 추가되는 이미지 노드
 */
export const ImageNodeView: React.FC<NodeViewProps> = (props) => {
  const { getPos } = props;
  const { src, alt, title, width, height, caption, textAlign } = props.node.attrs;
  const containerRef = useRef<HTMLDivElement>(null);
  const dialogImageRef = useRef<HTMLImageElement>(null);

  const [_align, setAlign] = useState<AlignType>(textAlign || 'center');

  const [currentWidth, setCurrentWidth] = useState<string>(width || '500px');
  const [currentHeight, setCurrentHeight] = useState<string>(height || 'auto');
  const [isViewerImageDialogOpen, setIsViewerImageDialogOpen] = useState<boolean>(false);
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (textAlign && textAlign !== _align) setAlign(textAlign as AlignType);
    if (width && width !== currentWidth) setCurrentWidth(width);
    if (height && height !== currentHeight) setCurrentHeight(height);
  }, [textAlign, width, height, _align, currentWidth, currentHeight]);

  const { imageRef, resizeState, resizeHandlers } = useImageResize({
    initialWidth: currentWidth,
    initialHeight: currentHeight,
    onResize: (newWidth, newHeight) => {
      setCurrentWidth(newWidth);
      setCurrentHeight(newHeight);

      props.updateAttributes({
        width: newWidth,
        height: newHeight,
      });
    },
  });

  const { hoverState, hoverHandlers } = useImageHover();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imageUpload = (props.editor?.extensionStorage as any)?.image?.onImageUpload as
    | ((file: File) => Promise<string>)
    | undefined;

  const { editingImage, isDialogOpen, openImageEdit, handleImageSave, setIsDialogOpen } = useImageEdit({
    editor: props.editor,
    upload: imageUpload,
  });

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      openImageEdit({
        src,
        caption,
        nodePos: getPos?.() || 0,
      });
    },
    [src, caption, getPos, openImageEdit]
  );

  const showControls = hoverState.isHovered || props.selected;

  const handleAlignChange = useCallback(
    (newAlign: AlignType) => {
      props.updateAttributes({ textAlign: newAlign });
      setAlign(newAlign);
    },
    [props]
  );

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => {
      const newZoom = Math.min(prev + 25, 500);
      // 확대 시 드래그 오프셋을 조정하여 이미지가 중앙에 유지되도록
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

  const handleZoomReset = useCallback(() => {
    setZoomLevel(100);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const handleImageDoubleClick = useCallback(() => {
    if (zoomLevel === 100) {
      setZoomLevel(200);
    } else {
      setZoomLevel(100);
      setDragOffset({ x: 0, y: 0 });
    }
  }, [zoomLevel]);

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

          return {
            x: constrainedX,
            y: constrainedY,
          };
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

  return (
    <NodeViewWrapper
      className={cn('we:my-2 we:w-full')}
      data-type='image'
      draggable='true'
      data-drag-handle
      style={{ textAlign: textAlign || _align }}
    >
      <section
        ref={containerRef}
        className={cn(
          'we:group we:relative we:inline-block',
          caption && 'we:mb-2',
          resizeState.isResizing ? 'we:resizing' : '',
          props.selected && props.editor.isEditable
            ? 'we:selected we:ring-primary/40 we:rounded-xs we:ring-2 we:ring-offset-2'
            : ''
        )}
        onMouseEnter={hoverHandlers.handleMouseEnter}
        onMouseLeave={hoverHandlers.handleMouseLeave}
        onClick={() => {
          if (!props.editor.isEditable) setIsViewerImageDialogOpen(true);
        }}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          title={title}
          className='we:mb-0 we:inline-block we:h-auto we:max-w-full we:rounded we:shadow-md'
          style={{
            width: currentWidth !== 'auto' ? currentWidth : undefined,
          }}
          draggable={false}
          onError={() => setImageLoadError(true)}
        />
        {caption && <ImageCaption caption={caption} imageWidth={currentWidth} />}
        {props.editor.isEditable && props.selected && (
          <ImageFloatingControls
            onEditClick={handleEditClick}
            onResizeStart={resizeHandlers.handleResizeStart}
            showControls={showControls}
            align={_align}
            onAlignChange={handleAlignChange}
          />
        )}
      </section>

      {isDialogOpen && editingImage && (
        <ImageEditDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          imageUrl={editingImage.src}
          currentCaption={editingImage.caption || ''}
          onSave={handleImageSave}
        />
      )}

      {!imageLoadError && isViewerImageDialogOpen && (
        <Dialog
          open={isViewerImageDialogOpen}
          onOpenChange={(open) => {
            setIsViewerImageDialogOpen(open);
            if (!open) {
              setZoomLevel(100);
              setDragOffset({ x: 0, y: 0 });
            }
          }}
        >
          <DialogTitle className='we:sr-only'>View Image</DialogTitle>
          <DialogContent className='we:p-2 we:mx-auto we:justify-center we:max-w-[90vw] we:w-max we:h-fit we:overflow-auto'>
            <div className='we:flex we:flex-col we:items-center we:gap-4'>
              <div
                className='we:relative we:overflow-clip we:rounded we:border we:bg-border/20 we:border-none we:grid we:place-items-center'
                onMouseDown={handleMouseDown}
                style={{ cursor: zoomLevel > 100 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
              >
                <div className='we:p-0 we:flex we:items-center we:justify-center'>
                  <img
                    ref={dialogImageRef}
                    src={src}
                    alt={alt}
                    title={title}
                    className='we:mb-0 we:inline-block we:w-full we:h-[80vh] we:rounded we:text-center we:object-contain we:transition-transform we:duration-200 we:select-none'
                    style={{
                      transform: `scale(${zoomLevel / 100}) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                      transformOrigin: 'center center',
                    }}
                    draggable={false}
                    onDoubleClick={handleImageDoubleClick}
                  />
                </div>
              </div>
              {caption && <ImageCaption caption={caption} className='we:mt-0 we:text-center' />}

              {/* 확대/축소 컨트롤 */}
              <div className='we:flex we:items-center we:justify-center we:gap-2 we:mt-2 we:mb-2'>
                <div className='we:flex we:items-center we:gap-3 we:px-2 we:py-1 we:border we:rounded-lg'>
                  <Button type='button' onClick={handleZoomOut} disabled={zoomLevel <= 50}>
                    <Minus />
                  </Button>
                  <span className='we:text-sm'>{zoomLevel}%</span>
                  <Button type='button' onClick={handleZoomIn} disabled={zoomLevel >= 200}>
                    <Plus />
                  </Button>
                </div>
                <Button type='button' onClick={handleZoomReset}>
                  <RefreshCcw className='we:h-4 we:w-4' />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </NodeViewWrapper>
  );
};
