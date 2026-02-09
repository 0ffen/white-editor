import { cn } from '@/shared/utils';

interface ImageCaptionProps {
  caption?: string;
  imageWidth?: string | number;
  className?: string;
}

/**
 * 이미지 캡션 컴포넌트
 */
export const ImageCaption: React.FC<ImageCaptionProps> = (props: ImageCaptionProps) => {
  const { caption, imageWidth, className } = props;

  if (!caption) return null;

  const captionStyle = imageWidth ? { maxWidth: typeof imageWidth === 'string' ? imageWidth : `${imageWidth}px` } : {};

  return (
    <div
      className={cn(
        'we:text-text-sub we:break-all we:mt-2 we:text-center we:text-xs we:whitespace-pre-wrap',
        className
      )}
      style={captionStyle}
    >
      {caption}
    </div>
  );
};
