import React from 'react';
import { AlignCenter, AlignLeft, AlignRight, Edit3 } from 'lucide-react';
import { Button, cn, Separator, Toolbar } from '@/shared';

interface ImageControlsProps {
  onEditClick: (e: React.MouseEvent) => void;
  onResizeStart: (e: React.MouseEvent) => void;
  showControls: boolean;
  align: 'left' | 'center' | 'right';
  onAlignChange: (align: 'left' | 'center' | 'right') => void;
}

const alignButtons = [
  { type: 'left', icon: AlignLeft, title: 'Align left' },
  { type: 'center', icon: AlignCenter, title: 'Align center' },
  { type: 'right', icon: AlignRight, title: 'Align right' },
];

export const ImageControls: React.FC<ImageControlsProps> = (props: ImageControlsProps) => {
  const { onEditClick, onResizeStart, showControls, align, onAlignChange } = props;
  if (!showControls) return null;

  return (
    <>
      <Toolbar
        variant='floating'
        className='we:absolute we:top-2 we:right-1/2 we:h-[40px] we:w-fit we:translate-x-1/2 we:border-none we:p-2'
        style={{
          boxShadow: 'var(--we-popover-shadow)',
        }}
      >
        {alignButtons.map(({ type, icon: Icon, title }) => (
          <Button
            key={type}
            onClick={() => onAlignChange(type as 'left' | 'center' | 'right')}
            title={title}
            type='button'
            className={cn(align === type && 'we:bg-primary/20')}
            isActive={align === type}
          >
            <Icon size={16} className={cn(align === type && 'we:text-primary')} />
          </Button>
        ))}
        <Separator orientation='vertical' className='we:mx-0.5 we:h-2' />
        <Button onClick={onEditClick} title='Edit image' type='button'>
          <Edit3 />
        </Button>
      </Toolbar>
      <div
        className='we:resize-handle we:bg-primary we:absolute we:-right-2 we:-bottom-2 we:h-4 we:w-4 we:cursor-se-resize we:rounded-full'
        onMouseDown={onResizeStart}
        title='Resize image'
      />
    </>
  );
};

interface ImageCaptionProps {
  caption?: string;
  imageWidth?: string | number;
  className?: string;
}

/**
 * 이미지 캡션 컴포넌트
 */
export const ImageCaption: React.FC<ImageCaptionProps> = ({ caption, imageWidth, className }) => {
  if (!caption) return null;

  const captionStyle = imageWidth ? { maxWidth: typeof imageWidth === 'string' ? imageWidth : `${imageWidth}px` } : {};

  return (
    <div
      className={cn(
        'we:text-foreground/80 we:word-break-keep we:mt-2 we:text-center we:text-xs we:whitespace-pre',
        className
      )}
      style={captionStyle}
    >
      {caption}
    </div>
  );
};
