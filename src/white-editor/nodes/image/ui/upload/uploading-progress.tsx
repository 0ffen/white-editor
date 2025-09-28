import { CloudUploadIcon, XIcon } from 'lucide-react';
import type { FileItem } from '@/white-editor';
import { Button } from '@/shared/components';

interface ImageUploadingProgressProps {
  fileItem: FileItem;
  onRemove: () => void;
}

/**
 * @ImageUploadingProgress
 * @description 파일 업로드 진행률 표시
 * @param fileItem {FileItem} 파일 정보
 * @param onRemove 파일 제거 함수
 */
export const ImageUploadingProgress: React.FC<ImageUploadingProgressProps> = (props: ImageUploadingProgressProps) => {
  const { fileItem, onRemove } = props;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className='border-border bg-background relative flex w-full items-center justify-between overflow-hidden rounded-lg border p-3'>
      {fileItem.status === 'uploading' && (
        <div
          className='bg-primary/10 absolute top-0 left-0 h-full transition-all'
          style={{ width: `${fileItem.progress}%` }}
        />
      )}

      <div className='relative flex items-center gap-3'>
        <div className='bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-md'>
          <CloudUploadIcon className='h-5 w-5' />
        </div>
        <div className='flex flex-col'>
          <span className='text-foreground max-w-[220px] truncate text-sm font-medium'>{fileItem.file.name}</span>
          <span className='text-muted-foreground text-xs'>{formatFileSize(fileItem.file.size)}</span>
        </div>
      </div>

      <div className='relative flex items-center gap-3'>
        {fileItem.status === 'uploading' && (
          <span className='text-primary text-sm font-medium'>{fileItem.progress}%</span>
        )}
        <Button
          type='button'
          variant='ghost'
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <XIcon className='h-5 w-5' />
        </Button>
      </div>
    </div>
  );
};
