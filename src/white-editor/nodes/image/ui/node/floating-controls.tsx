import React from 'react';
import { AlignCenter, AlignLeft, AlignRight, Edit3 } from 'lucide-react';
import { Button, cn, Separator, Toolbar } from '@/shared';

interface ImageFloatingControlsProps {
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

/**
 * 이미지 클릭시 노출되는 플로팅 메뉴
 */
export const ImageFloatingControls: React.FC<ImageFloatingControlsProps> = (props: ImageFloatingControlsProps) => {
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
