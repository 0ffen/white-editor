import React, { useEffect, useMemo } from 'react';
import katex from 'katex';
import { CornerDownLeft, Trash2Icon } from 'lucide-react';
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
    <div className={cn('flex w-full flex-col gap-2', mathPopoverClassName)}>
      <div className='flex w-full gap-1'>
        <Input
          type='text'
          placeholder={placeholder || 'Enter LaTeX expression'}
          value={mathString}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMathString(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete='off'
          autoCorrect='off'
          autoCapitalize='off'
          className='w-full border-none'
          ref={inputRef}
        />
        <ButtonGroup orientation='horizontal'>
          <Button
            type='button'
            onClick={setMath}
            disabled={!mathString && !isActive}
            title='Apply Math'
            className='text-foreground/80'
            size={'icon'}
          >
            <CornerDownLeft />
          </Button>
          <Button
            type='button'
            onClick={removeMath}
            title='Remove math'
            disabled={!mathString && !isActive}
            variant='ghost'
            className='text-foreground/80'
            size={'icon'}
          >
            <Trash2Icon />
          </Button>
        </ButtonGroup>
      </div>

      {previewHtml && (
        <div className='bg-muted/50 flex min-h-8 items-center justify-center rounded-md px-2 py-3'>
          <div className='text-foreground text-sm' dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
      )}
    </div>
  );
};
