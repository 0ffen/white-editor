import React from 'react';
import { CloudUploadIcon } from 'lucide-react';
import { cn } from '@/shared';

interface ImageUploadDragAreaProps {
  /**
   * 파일이 드롭되거나 선택될 때 호출되는 콜백 함수
   * @param {File[]} files - 드롭되거나 선택된 파일 객체 배열
   */
  onFile: (files: File[]) => void;
  limit: number;
  maxSize: number;
}

export const ImageUploadDragArea: React.FC<ImageUploadDragAreaProps> = (props: ImageUploadDragAreaProps) => {
  const { onFile, limit, maxSize } = props;

  const [isDragActive, setIsDragActive] = React.useState<boolean>(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragActive(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFile(files);
    }
  };

  return (
    <div
      className={cn(
        'we:border-border/70 we:hover:border-border we:bg-background we:flex we:cursor-pointer we:flex-col we:items-center we:justify-center we:gap-4 we:rounded-md we:border we:border-dashed we:p-8 we:transition-colors',
        isDragActive ? 'we:border-border we:bg-border/5' : ''
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CloudUploadIcon className={cn('we:text-primary/95 we:h-10 we:w-10', isDragActive ? 'we:text-primary' : '')} />
      <div className='we:text-muted-foreground/80 we:flex we:flex-col we:items-center we:gap-1'>
        <span className='we:text-sm'>Click to upload or drag and drop</span>
        <span className='we:text-xs'>
          Maximum {limit} file{limit === 1 ? '' : 's'}, {maxSize / 1024 / 1024}MB
        </span>
      </div>
    </div>
  );
};
