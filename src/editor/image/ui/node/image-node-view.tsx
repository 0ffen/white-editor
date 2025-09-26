import React, { useCallback, useRef } from 'react';
import { useImageEdit, useImageHover, useImageResize, ImageEditDialog } from '@/editor';
import { cn } from '@/shared';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { ImageControls, ImageCaption } from './image-components';

/**
 * @name ImageNodeView
 * @description Editor 내에 추가되는 이미지 노드
 */
export const ImageNodeView: React.FC<NodeViewProps> = (props) => {
  const { getPos } = props;
  const { src, alt, title, width, height, caption } = props.node.attrs;
  const containerRef = useRef<HTMLDivElement>(null);

  const { imageRef, resizeState, resizeHandlers } = useImageResize({
    initialWidth: width || 'auto',
    initialHeight: height || 'auto',
    onResize: (newWidth, newHeight) => {
      props.updateAttributes({
        width: newWidth,
        height: newHeight,
      });
    },
  });
  const { hoverState, hoverHandlers } = useImageHover();
  const { editingImage, isDialogOpen, openImageEdit, handleImageSave, setIsDialogOpen } = useImageEdit({
    editor: props.editor,
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
  const { currentWidth, currentHeight, isResizing } = resizeState;

  return (
    <NodeViewWrapper className='relative inline-block' data-type='image' draggable='true' data-drag-handle>
      <section
        ref={containerRef}
        className={cn(
          'group relative inline-block',
          caption && 'mb-2',
          isResizing ? 'resizing' : '',
          props.selected ? 'selected ring-primary/40 rounded-xs ring-2 ring-offset-2' : ''
        )}
        onMouseEnter={hoverHandlers.handleMouseEnter}
        onMouseLeave={hoverHandlers.handleMouseLeave}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          title={title}
          className='mb-0 h-auto max-w-full rounded shadow-md'
          style={{
            width: currentWidth !== 'auto' ? currentWidth : undefined,
            height: currentHeight !== 'auto' ? currentHeight : undefined,
          }}
          draggable={false}
        />
        {caption && <ImageCaption caption={caption} />}
        {props.selected && (
          <ImageControls
            onEditClick={handleEditClick}
            onResizeStart={resizeHandlers.handleResizeStart}
            showControls={showControls}
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
    </NodeViewWrapper>
  );
};
