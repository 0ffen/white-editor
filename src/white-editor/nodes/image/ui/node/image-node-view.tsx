import React, { useCallback, useRef, useState, useEffect } from 'react';
import { cn, Dialog, DialogContent, DialogTitle } from '@/shared';
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
  const { src, alt, title, width, height, caption, textAlign } = props.node.attrs;
  const containerRef = useRef<HTMLDivElement>(null);
  const [_align, setAlign] = useState<AlignType>(textAlign || 'center');
  const [isViewerImageDialogOpen, setIsViewerImageDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    if (textAlign && textAlign !== _align) {
      setAlign(textAlign as AlignType);
    }
  }, [textAlign, _align]);

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
        textAlign: newAlign,
      });
      setAlign(newAlign);
    },
    [props]
  );

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
          isResizing ? 'we:resizing' : '',
          props.selected && props.editor.isEditable
            ? 'we:selected we:ring-primary/40 we:rounded-xs we:ring-2 we:ring-offset-2'
            : ''
        )}
        onMouseEnter={hoverHandlers.handleMouseEnter}
        onMouseLeave={hoverHandlers.handleMouseLeave}
        onClick={() => {
          if (!props.editor.isEditable) {
            setIsViewerImageDialogOpen(true);
          }
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
      {isViewerImageDialogOpen && (
        <Dialog open={isViewerImageDialogOpen} onOpenChange={setIsViewerImageDialogOpen}>
          <DialogTitle className='we:sr-only'>View Image</DialogTitle>
          <DialogContent className='we:mx-auto we:justify-center'>
            <img
              style={{
                width: 'auto',
                height: '300px',
              }}
              ref={imageRef}
              src={src}
              alt={alt}
              title={title}
              className='we:mb-0 we:inline-block we:h-auto we:max-w-full we:rounded we:text-center'
              draggable={false}
            />
            {caption && <ImageCaption caption={caption} className='we:mt-0 we:text-center' />}
          </DialogContent>
        </Dialog>
      )}
    </NodeViewWrapper>
  );
};
