import React from 'react';
import { Edit3 } from 'lucide-react';
import { Button } from '@/shared';

interface ImageControlsProps {
  onEditClick: (e: React.MouseEvent) => void;
  onResizeStart: (e: React.MouseEvent) => void;
  showControls: boolean;
}

/**
 * 이미지 편집 및 리사이즈 컨트롤 컴포넌트
 */
export const ImageControls: React.FC<ImageControlsProps> = ({ onEditClick, onResizeStart, showControls }) => {
  if (!showControls) return null;

  return (
    <>
      {/* Edit Button */}
      <Button
        onClick={onEditClick}
        variant='secondary'
        className='absolute top-2 right-2 h-6 w-6 rounded-full p-2 shadow-lg'
        title='Edit image'
        type='button'
      >
        <Edit3 size={16} className='text-muted-foreground' />
      </Button>

      {/* Resize Handle */}
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
}

/**
 * 이미지 캡션 컴포넌트
 */
export const ImageCaption: React.FC<ImageCaptionProps> = ({ caption }) => {
  if (!caption) return null;

  return <div className='text-muted-foreground mt-2 text-center text-sm font-medium'>{caption}</div>;
};
