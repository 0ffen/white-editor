import * as React from 'react';
import { ImageOff, XIcon } from 'lucide-react';
import { Button } from '@/shared';

export interface ImageErrorBlockProps {
  /** 인라인(가로 배치 + X 버튼) | 조회(중앙 블록, X 없음) */
  variant: 'inline' | 'viewer';
  /** 에러 메시지 (i18n 적용된 문자열) */
  mainText: string;
  /** 파일명 (선택) */
  filename?: string;
  /** 제거 버튼 클릭 시 (inline일 때만 사용) */
  onRemove?: () => void;
}

/**
 * 이미지 에러 블록: 업로드 실패 / 이미지 깨짐 / 조회 시 이미지 깨짐 공통 UI
 */
export const ImageErrorBlock: React.FC<ImageErrorBlockProps> = ({ variant, mainText, filename, onRemove }) => {
  if (variant === 'viewer') {
    return (
      <div className='we:mt-4 we:flex we:h-[200px] we:w-[200px] we:flex-col we:justify-center we:gap-2 we:rounded-[5px] we:bg-elevation-level2 we:px-4 we:py-6 we:select-none we:mx-auto'>
        <ImageOff className='we:h-5 we:w-5 we:text-text-light we:shrink-0' aria-hidden />
        <p className='we:text-[14px]! we:mt-0! we:text-text-sub! we:text-start! we:break-words! we:select-none!'>
          {mainText}
        </p>
        {filename && (
          <p className='we:text-text-light! we:text-[12px]! we:mt-0! we:text-start! we:select-none! we:truncate! we:max-w-[150px]!'>
            {filename}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className='we:mt-4 we:flex we:items-center we:gap-3 we:rounded-[5px] we:bg-elevation-level2 we:p-3 we:min-w-[412px] we:max-w-[412px] we:w-fit we:box-border'>
      <ImageOff className='we:h-5 we:w-5 we:shrink-0 we:text-text-light' aria-hidden />
      <div className='we:min-w-0 we:flex-1 we:flex we:gap-2 we:items-center'>
        <p className='we:text-[14px]! we:mt-0! we:text-text-sub! we:text-start! we:break-words! we:select-none!'>
          {mainText}
        </p>
        {filename && (
          <p className='we:text-text-light! we:text-[12px]! we:mt-0! we:select-none! we:truncate! we:max-w-[150px]!'>
            {filename}
          </p>
        )}
      </div>
      {onRemove && (
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='we:shrink-0'
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <XIcon className='we:h-5 we:w-5 we:text-text-light' />
        </Button>
      )}
    </div>
  );
};
