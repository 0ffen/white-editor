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
        className='absolute top-2 right-1/2 h-[40px] w-fit translate-x-1/2 border-none p-2'
        style={{
          boxShadow: 'var(--popover-shadow)',
        }}
      >
        {alignButtons.map(({ type, icon: Icon, title }) => (
          <Button
            key={type}
            onClick={() => onAlignChange(type as 'left' | 'center' | 'right')}
            title={title}
            type='button'
            className={cn(align === type && 'bg-primary/20')}
            isActive={align === type}
          >
            <Icon size={16} className={cn(align === type && 'text-primary')} />
          </Button>
        ))}
        <Separator orientation='vertical' className='mx-0.5 h-2' />
        <Button onClick={onEditClick} title='Edit image' type='button'>
          <Edit3 />
        </Button>
      </Toolbar>
      <div
        className='resize-handle bg-primary absolute -right-2 -bottom-2 h-4 w-4 cursor-se-resize rounded-full'
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
      className={cn('text-foreground/80 word-break-keep mt-2 text-center text-xs whitespace-pre', className)}
      style={captionStyle}
    >
      {caption}
    </div>
  );
};
