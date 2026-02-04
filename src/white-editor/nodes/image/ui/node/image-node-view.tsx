import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Minus, Plus, Download, X } from 'lucide-react';
import { Button, Dialog, DialogContent, DialogTitle, Separator, cn, getTranslate } from '@/shared';
import {
  ImageCaption,
  ImageEditDialog,
  ImageErrorBlock,
  ImageFloatingControls,
  useImageEdit,
  useImageHover,
  useImageResize,
  downloadImage,
  getFilenameFromSrc,
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
  const { src, alt, title, width, height, caption, textAlign, uploadingProgress, uploadError, uploadErrorFileName } =
    props.node.attrs;
  const containerRef = useRef<HTMLDivElement>(null);
  const dialogImageRef = useRef<HTMLImageElement>(null);

  const [_align, setAlign] = useState<AlignType>(textAlign || 'center');

  const [currentWidth, setCurrentWidth] = useState<string>(width || '500px');
  const [currentHeight, setCurrentHeight] = useState<string>(height || 'auto');
  const [isViewerImageDialogOpen, setIsViewerImageDialogOpen] = useState<boolean>(false);
  const [isCaptionEditing, setIsCaptionEditing] = useState<boolean>(false);
  const [captionInput, setCaptionInput] = useState<string>(caption || '');
  const captionInputRef = useRef<HTMLTextAreaElement>(null);
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
  const extension = (props.editor?.extensionStorage as any)?.image?.extension as
    | {
        imageUpload?: {
          upload?: (file: File) => Promise<string>;
          onError?: (error: Error) => void;
          onSuccess?: (url: string) => void;
        };
      }
    | undefined;

  const { editingImage, isDialogOpen, openImageEdit, handleImageSave, setIsDialogOpen } = useImageEdit({
    editor: props.editor,
    extension: extension,
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

  const RECOMMENDED_WIDTH = '500px';

  const handleWidthModeChange = useCallback(
    (mode: 'recommended' | 'full') => {
      const nextWidth = mode === 'recommended' ? RECOMMENDED_WIDTH : '100%';
      const nextHeight = 'auto';
      setCurrentWidth(nextWidth);
      setCurrentHeight(nextHeight);
      resizeHandlers.setCurrentWidth(nextWidth);
      resizeHandlers.setCurrentHeight(nextHeight);
      props.updateAttributes({ width: nextWidth, height: nextHeight });
    },
    [props, resizeHandlers]
  );

  const handleCaptionClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCaptionInput(caption || '');
      setIsCaptionEditing(true);
    },
    [caption]
  );

  const handleCaptionCommit = useCallback(() => {
    props.updateAttributes({ caption: captionInput });
    setIsCaptionEditing(false);
  }, [props, captionInput]);

  useEffect(() => {
    if (isCaptionEditing && captionInputRef.current) {
      const el = captionInputRef.current;
      el.focus();
      // DOM에 value 반영 후 커서를 텍스트 끝으로 이동
      const timer = setTimeout(() => {
        const len = el.value.length;
        el.setSelectionRange(len, len);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isCaptionEditing]);

  // 캡션 textarea 내용에 맞춰 높이 자동 확장 (스크롤 없음)
  useEffect(() => {
    const el = captionInputRef.current;
    if (!el || !isCaptionEditing) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [isCaptionEditing, captionInput]);

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

  const handleImageDoubleClick = useCallback(() => {
    if (zoomLevel === 100) {
      setZoomLevel(200);
    } else {
      setZoomLevel(100);
      setDragOffset({ x: 0, y: 0 });
    }
  }, [zoomLevel]);

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
      data-full-width={currentWidth === '100%'}
      draggable='true'
      style={{ textAlign: textAlign || _align }}
    >
      <section
        ref={containerRef}
        className={cn(
          'we:group we:relative',
          currentWidth === '100%' ? 'we:w-full we:block' : 'we:inline-block',
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
        {/* 리사이즈 기준 요소: 정상 시 img, 에러 시 래퍼에 ref 부여해 드래그로 크기 조절 가능 */}
        <div
          ref={imageRef}
          className={cn(currentWidth === '100%' ? 'we:block we:w-full' : 'we:inline-block we:max-w-full')}
          style={{
            width:
              !uploadError && !imageLoadError && currentWidth !== 'auto' && currentWidth !== '100%'
                ? currentWidth
                : undefined,
            height: !uploadError && !imageLoadError && currentHeight !== 'auto' ? currentHeight : undefined,
          }}
        >
          {/* 업로드 실패: 에러 블록 */}
          {uploadError && props.editor.isEditable && (
            <ImageErrorBlock
              variant='inline'
              mainText={getTranslate('이미지를 업로드 할 수 없습니다')}
              filename={uploadErrorFileName}
              onRemove={() => {
                const pos = getPos?.();
                if (pos != null) {
                  props.editor
                    .chain()
                    .focus()
                    .deleteRange({ from: pos, to: pos + props.node.nodeSize })
                    .run();
                }
              }}
            />
          )}

          {/* 이미지 깨짐 (에디터): 에러 블록 */}
          {!uploadError && imageLoadError && props.editor.isEditable && (
            <ImageErrorBlock
              variant='inline'
              mainText={getTranslate('이미지를 찾을 수 없습니다')}
              filename={getFilenameFromSrc(src) || undefined}
              onRemove={() => {
                const pos = getPos?.();
                if (pos != null) {
                  props.editor
                    .chain()
                    .focus()
                    .deleteRange({ from: pos, to: pos + props.node.nodeSize })
                    .run();
                }
              }}
            />
          )}

          {/* 이미지 (정상일 때만 표시) */}
          {!uploadError && !imageLoadError && (
            <img
              src={src}
              alt={alt}
              title={title}
              className='we:mb-0 we:block we:h-auto we:w-full we:max-w-full we:rounded we:shadow-md'
              style={{
                width: currentWidth !== 'auto' ? currentWidth : undefined,
              }}
              draggable={false}
              onError={() => setImageLoadError(true)}
            />
          )}
        </div>

        {/* 조회 시 이미지 깨짐: 큰 블록, 아이콘 중앙, X 없음 */}
        {!props.editor.isEditable && imageLoadError && (
          <ImageErrorBlock
            variant='viewer'
            mainText={getTranslate('삭제되었거나 찾을 수 없는 이미지입니다')}
            filename={getFilenameFromSrc(src) || undefined}
          />
        )}
        {uploadingProgress != null && (
          <div className='we:absolute we:right-2 we:bottom-2 we:flex we:h-5 we:items-center we:justify-center we:gap-1 we:rounded-[2px] we:px-1 we:bg-elevation-opacity-2 we:text-text-inverse'>
            <Loader2 className='we:h-3.5 we:w-3.5 we:animate-spin' aria-hidden />
            <span className='we:text-xs we:font-medium we:text-text-inverse'>Uploading {uploadingProgress}%</span>
          </div>
        )}
        {props.editor.isEditable && isCaptionEditing ? (
          <textarea
            ref={captionInputRef}
            value={captionInput}
            onChange={(e) => setCaptionInput(e.target.value)}
            onBlur={handleCaptionCommit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                (e.target as HTMLTextAreaElement).blur();
              }
            }}
            placeholder={getTranslate('캡션을 입력하세요')}
            rows={1}
            className={cn(
              'we:mt-2 we:w-full we:min-h-[2.5rem] we:resize-none we:overflow-hidden we:border-0 we:bg-transparent we:text-center we:text-xs we:text-foreground/80 we:outline-none we:placeholder:we:text-muted-foreground'
            )}
            style={currentWidth !== '100%' ? { maxWidth: currentWidth } : undefined}
          />
        ) : caption ? (
          <ImageCaption caption={caption} imageWidth={currentWidth} />
        ) : null}
        {props.editor.isEditable && props.selected && !uploadError && !imageLoadError && (
          <ImageFloatingControls
            onEditClick={handleEditClick}
            onResizeStart={resizeHandlers.handleResizeStart}
            showControls={showControls}
            align={_align}
            onAlignChange={handleAlignChange}
            onWidthModeChange={handleWidthModeChange}
            widthMode={currentWidth === '100%' ? 'full' : 'recommended'}
            onCaptionClick={handleCaptionClick}
            isCaptionEditing={isCaptionEditing}
          />
        )}
      </section>

      {isDialogOpen && editingImage && (
        <ImageEditDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          imageUrl={editingImage.src}
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
          <DialogContent
            hideCloseButton
            className='we:bg-transparent we:shadow-none we:p-0 we:max-w-none we:w-full we:h-full we:min-h-[100dvh] we:top-0 we:left-0 we:translate-x-0 we:translate-y-0 we:rounded-none we:flex we:flex-col we:overflow-hidden'
          >
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
                  draggable={false}
                  onDoubleClick={handleImageDoubleClick}
                />
              </div>

              {/* 하단 툴바: -, 100%, +, 다운로드, 닫기*/}
              <div className='we:flex we:w-fit we:flex-shrink-0 we:mb-[40px] we:items-center we:justify-center we:gap-1 we:rounded-sm we:py-1 we:px-1 we:bg-elevation-opacity-2 we:text-text-inverse'>
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
                  onClick={() => setIsViewerImageDialogOpen(false)}
                  tooltip={getTranslate('닫기')}
                >
                  <X className='we:h-5 we:w-5' />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </NodeViewWrapper>
  );
};
