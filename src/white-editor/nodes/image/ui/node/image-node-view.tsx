import React, { useCallback, useRef, useState } from 'react';
import { cn } from '@/shared';
import { useImageEdit, useImageHover, useImageResize, ImageEditDialog } from '@/white-editor';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { ImageControls, ImageCaption } from './image-components';

type AlignType = 'left' | 'center' | 'right';

/**
 * @name ImageNodeView
 * @description Editor 내에 추가되는 이미지 노드
 */
export const ImageNodeView: React.FC<NodeViewProps> = (props) => {
  const { getPos } = props;
  const { src, alt, title, width, height, caption, align } = props.node.attrs;
  const containerRef = useRef<HTMLDivElement>(null);
  const [_align, setAlign] = useState<AlignType>(align || 'center');

  const { imageRef, resizeState, resizeHandlers } = useImageResize({
    initialWidth: width || '300px',
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

  const handleAlignChange = useCallback(
    (newAlign: AlignType) => {
      props.updateAttributes({
        align: newAlign,
      });
      setAlign(newAlign);
    },
    [props]
  );

  return (
    <NodeViewWrapper
      className={cn('my-2 w-full')}
      data-type='image'
      draggable='true'
      data-drag-handle
      style={{ textAlign: _align }}
    >
      <section
        ref={containerRef}
        className={cn(
          'group relative inline-block',
          caption && 'mb-2',
          isResizing ? 'resizing' : '',
          props.selected && props.editor.isEditable ? 'selected ring-primary/40 rounded-xs ring-2 ring-offset-2' : ''
        )}
        onMouseEnter={hoverHandlers.handleMouseEnter}
        onMouseLeave={hoverHandlers.handleMouseLeave}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          title={title}
          className='mb-0 inline-block h-auto max-w-full rounded shadow-md'
          style={{
            width: currentWidth !== 'auto' ? currentWidth : undefined,
            height: currentHeight !== 'auto' ? currentHeight : undefined,
          }}
          draggable={false}
        />
        {caption && <ImageCaption caption={caption} imageWidth={currentWidth} />}
        {props.editor.isEditable && props.selected && (
          <ImageControls
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
    </NodeViewWrapper>
  );
};
