import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn, useTranslate } from '@/shared';
import {
  ImageCaption,
  ImageEditDialog,
  ImageErrorBlock,
  ImageFloatingControls,
  useImageEdit,
  useImageHover,
  useImageResize,
  getFilenameFromSrc,
} from '@/white-editor';
import type { NodeViewProps } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';

import { ImageViewerModal } from './image-viewer-modal';

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
  const t = useTranslate();

  const [_align, setAlign] = useState<AlignType>(textAlign || 'center');

  const [currentWidth, setCurrentWidth] = useState<string>(width || '500px');
  const [currentHeight, setCurrentHeight] = useState<string>(height || 'auto');
  const [isViewerImageDialogOpen, setIsViewerImageDialogOpen] = useState<boolean>(false);
  const [isCaptionEditing, setIsCaptionEditing] = useState<boolean>(false);
  const [captionInput, setCaptionInput] = useState<string>(caption || '');
  const captionInputRef = useRef<HTMLTextAreaElement>(null);
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);

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

  return (
    <NodeViewWrapper
      className={cn('we:w-full')}
      data-type='image'
      data-full-width={currentWidth === '100%'}
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
            ? 'we:selected we:border-none we:ring-2 we:ring-offset-2 we:ring-brand-default we:rounded-xs'
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
          className={cn(currentWidth === '100%' ? 'we:block we:w-full' : 'we:inline we:max-w-full')}
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
              mainText={t('이미지를 업로드 할 수 없습니다')}
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
              mainText={t('이미지를 찾을 수 없습니다')}
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
              className='we:mb-0 we:block we:h-auto we:w-full we:max-w-full we:rounded we:shadow-md we:mt-0'
              style={{
                width: currentWidth !== 'auto' ? currentWidth : undefined,
              }}
              onError={() => setImageLoadError(true)}
              draggable={false}
              data-drag-handle
            />
          )}
        </div>

        {/* 조회 시 이미지 깨짐: 큰 블록, 아이콘 중앙, X 없음 */}
        {!props.editor.isEditable && imageLoadError && (
          <ImageErrorBlock
            variant='viewer'
            mainText={t('삭제되었거나 찾을 수 없는 이미지입니다')}
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
            id='image-caption-input'
            ref={captionInputRef}
            value={captionInput}
            onChange={(e) => setCaptionInput(e.target.value)}
            onBlur={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCaptionCommit();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation();
                if (!e.shiftKey) {
                  e.preventDefault();
                  (e.target as HTMLTextAreaElement).blur();
                }
              }
            }}
            placeholder={t('캡션을 입력하세요')}
            rows={1}
            className={cn(
              'we:mt-2 we:w-full we:min-h-[2.5rem] we:text-xs we:resize-none we:overflow-hidden we:border-0 we:bg-transparent we:text-center we:text-foreground/80 we:outline-none we:placeholder:we:text-muted-foreground'
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

      {!imageLoadError && (
        <ImageViewerModal
          open={isViewerImageDialogOpen}
          onOpenChange={setIsViewerImageDialogOpen}
          src={src}
          alt={alt}
          title={title}
        />
      )}
    </NodeViewWrapper>
  );
};
