import { CloudUploadIcon, XIcon } from 'lucide-react';
import { Button } from '@/shared/components';
import type { FileItem } from '@/white-editor';

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
    <div className='we:border-border we:bg-background we:relative we:flex we:w-full we:items-center we:justify-between we:overflow-hidden we:rounded-lg we:border we:p-3'>
      {fileItem.status === 'uploading' && (
        <div
          className='we:bg-primary/10 we:absolute we:top-0 we:left-0 we:h-full we:transition-all'
          style={{ width: `${fileItem.progress}%` }}
        />
      )}

      <div className='we:relative we:flex we:items-center we:gap-3'>
        <div className='we:bg-primary/10 we:text-primary we:flex we:h-10 we:w-10 we:items-center we:justify-center we:rounded-md'>
          <CloudUploadIcon className='we:h-5 we:w-5' />
        </div>
        <div className='we:flex we:flex-col'>
          <span className='we:text-foreground we:max-w-[220px] we:truncate we:text-sm we:font-medium'>
            {fileItem.file.name}
          </span>
          <span className='we:text-muted-foreground we:text-xs'>{formatFileSize(fileItem.file.size)}</span>
        </div>
      </div>

      <div className='we:relative we:flex we:items-center we:gap-3'>
        {fileItem.status === 'uploading' && (
          <span className='we:text-primary we:text-sm we:font-medium'>{fileItem.progress}%</span>
        )}
        <Button
          type='button'
          variant='ghost'
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <XIcon className='we:h-5 we:w-5' />
        </Button>
      </div>
    </div>
  );
};
