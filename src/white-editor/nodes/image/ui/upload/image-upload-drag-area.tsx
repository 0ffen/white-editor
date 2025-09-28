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
        'border-border/70 hover:border-border bg-background flex cursor-pointer flex-col items-center justify-center gap-4 rounded-md border border-dashed p-8 transition-colors',
        isDragActive ? 'border-border bg-border/5' : ''
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CloudUploadIcon className={cn('text-primary/95 h-10 w-10', isDragActive ? 'text-primary' : '')} />
      <div className='text-muted-foreground/80 flex flex-col items-center gap-1'>
        <span className='text-sm'>Click to upload or drag and drop</span>
        <span className='text-xs'>
          Maximum {limit} file{limit === 1 ? '' : 's'}, {maxSize / 1024 / 1024}MB
        </span>
      </div>
    </div>
  );
};
