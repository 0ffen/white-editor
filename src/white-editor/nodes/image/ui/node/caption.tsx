import { cn } from '@/shared/utils';

interface ImageCaptionProps {
  caption?: string;
  imageWidth?: string | number;
  className?: string;
}

/**
 * 이미지 캡션 컴포넌트
 *
 * 캡션은 실제 텍스트 노드로 렌더링한다. (CSS `content: attr()` 의사 요소는 브라우저에 따라
 * 클립보드에 포함되지 않아 뷰어에서 복사되지 않는다.)
 * `data-image-caption`은 붙여넣기 시 캡션이 중복되지 않도록 제거하는 마커로 사용된다.
 * @see resizable-image.ts `transformPastedHTML`
 */
export const ImageCaption: React.FC<ImageCaptionProps> = (props: ImageCaptionProps) => {
  const { caption, imageWidth, className } = props;

  if (!caption) return null;

  const captionStyle = imageWidth ? { maxWidth: typeof imageWidth === 'string' ? imageWidth : `${imageWidth}px` } : {};

  return (
    <div
      data-image-caption={caption}
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
