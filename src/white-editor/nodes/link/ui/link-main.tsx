import { useEffect, useRef } from 'react';
import { Check, Unlink } from 'lucide-react';
import { getTranslate } from '@/shared';
import { Button, Input } from '@/shared/components';
import { cn } from '@/shared/utils';

export interface LinkMainProps {
  url: string;
  setUrl: React.Dispatch<React.SetStateAction<string | null>>;
  setLink: () => void;
  removeLink: () => void;
  isActive: boolean;
  placeholder?: string;
  linkPopoverClassName?: string;
}

export const LinkMain: React.FC<LinkMainProps> = ({
  url,
  setUrl,
  setLink,
  removeLink,
  placeholder,
  isActive,
  linkPopoverClassName,
}: LinkMainProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  // 이미 링크가 있는 경우 (isActive가 true이고 url이 있는 경우)
  const hasExistingLink = isActive && url;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // ctrl+A 또는 cmd+A (전체 선택) 허용 - 기본 동작 유지
    if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
      return; // 기본 동작 허용
    }

    // alt+A (전체 선택) 허용 - 기본 동작 유지
    if (event.altKey && event.key === 'a') {
      return; // 기본 동작 허용
    }

    // Delete, Backspace 키는 기본 동작 허용
    if (event.key === 'Delete' || event.key === 'Backspace') {
      return; // 기본 동작 허용
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const trimmed = url.trim();
      if (trimmed) {
        setLink();
      } else if (isActive) {
        // 수정 시 텍스트를 모두 지우고 엔터면 링크 해제
        removeLink();
      }
    }
  };

  return (
    <div className={cn('we:flex we:items-center we:gap-2 we:w-full', linkPopoverClassName)}>
      {/* 입력 필드 */}
      <Input
        type='url'
        id='link-input'
        placeholder={placeholder || getTranslate('링크를 입력하세요')}
        value={url}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
        onKeyDown={handleKeyDown}
        autoComplete='off'
        autoCorrect='off'
        autoCapitalize='off'
        className='we:flex-1 we:w-full we:border-none we:text-text-normal'
        ref={inputRef}
      />

      {/* 오른쪽 아이콘들 */}
      <div className='we:flex we:items-center we:gap-2 we:shrink-0'>
        {hasExistingLink ? (
          <>
            {/* 이미 링크가 있는 경우: 체크와 언링크 아이콘 */}
            <Button
              type='button'
              size='icon'
              className='we:size-7 we:cursor-pointer we:p-1'
              onClick={() => {
                if (url) {
                  setLink();
                }
              }}
              tooltip={getTranslate('확인')}
            >
              <Check className={cn('we:text-text-sub', !url && 'we:text-text-light')} size={20} />
            </Button>

            <Button
              tooltip={getTranslate('링크 제거')}
              type='button'
              size='icon'
              className='we:size-7 we:cursor-pointer we:p-1'
              onClick={removeLink}
            >
              <Unlink className={cn('we:text-text-sub', !url && 'we:text-text-light')} size={20} />
            </Button>
          </>
        ) : (
          /* 처음 입력 시: 체크 아이콘만 */
          <Button
            type='button'
            size='icon'
            className='we:size-7 we:cursor-pointer we:p-1'
            onClick={() => {
              if (url) {
                setLink();
              }
            }}
            tooltip={getTranslate('확인')}
          >
            <Check className={cn('we:text-text-sub', !url && 'we:text-text-light')} size={20} />
          </Button>
        )}
      </div>
    </div>
  );
};
