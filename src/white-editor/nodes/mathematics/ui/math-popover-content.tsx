import React, { useEffect, useMemo } from 'react';
import katex from 'katex';
import { CornerDownLeft, Trash2Icon } from 'lucide-react';
import { getTranslate } from '@/shared';
import { Button, ButtonGroup, Input } from '@/shared/components';
import { cn } from '@/shared/utils';

interface Props {
  mathPopoverClassName?: string;
  placeholder?: string;
  mathString: string;
  setMathString: (mathString: string) => void;
  isActive: boolean;
  removeMath: () => void;
  setMath: () => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const MathPopoverContent = (props: Props) => {
  const { mathPopoverClassName, placeholder, mathString, isActive, setMath, removeMath, handleKeyDown, setMathString } =
    props;
  const inputRef = React.useRef<HTMLInputElement>(null);

  const previewHtml = useMemo(() => {
    if (!mathString.trim()) return '';

    try {
      return katex.renderToString(mathString, {
        throwOnError: false,
        displayMode: false,
        output: 'html',
        strict: false,
      });
    } catch {
      return `<span>Invalid LaTeX: ${mathString}</span>`;
    }
  }, [mathString]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      const value = inputRef.current.value;
      if (value) {
        const length = value.length;
        inputRef.current.setSelectionRange(length, length);
      }
    }
  }, []);

  return (
    <div className={cn('we:flex we:w-full we:flex-col we:gap-2', mathPopoverClassName)}>
      <div className='we:flex we:w-full we:gap-1'>
        <Input
          type='text'
          placeholder={placeholder || getTranslate('입력하세요')}
          value={mathString}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMathString(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete='off'
          autoCorrect='off'
          autoCapitalize='off'
          className='we:w-full we:border-none'
          ref={inputRef}
        />
        <ButtonGroup orientation='horizontal'>
          <Button
            type='button'
            onClick={setMath}
            disabled={!mathString && !isActive}
            title={getTranslate('적용')}
            size={'icon'}
          >
            <CornerDownLeft className='we:text-text-sub' />
          </Button>
          <Button
            type='button'
            size='icon'
            variant='ghost'
            onClick={removeMath}
            title='Remove math'
            disabled={!mathString && !isActive}
          >
            <Trash2Icon className='we:text-text-sub' />
          </Button>
        </ButtonGroup>
      </div>

      {previewHtml && (
        <div className='we:bg-muted/50 we:flex we:min-h-8 we:items-center we:justify-center we:rounded-md we:px-2 we:py-3'>
          <div className='we:text-foreground we:text-sm' dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
      )}
    </div>
  );
};
