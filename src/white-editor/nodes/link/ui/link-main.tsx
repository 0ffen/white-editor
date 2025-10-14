import { useEffect, useRef } from 'react';
import { CornerDownLeft, Trash2Icon } from 'lucide-react';
import { Button, ButtonGroup, Input } from '@/shared/components';
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

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setLink();
    }
  };

  return (
    <div className={cn('we:flex we:w-full we:gap-1 we:rounded-4xl', linkPopoverClassName)}>
      <Input
        type='url'
        placeholder={placeholder || 'Paste a Link'}
        value={url}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
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
          onClick={setLink}
          disabled={!url && !isActive}
          title='Apply Link'
          className='we:text-foreground/80'
          size={'icon'}
        >
          <CornerDownLeft />
        </Button>
        <Button
          type='button'
          onClick={removeLink}
          title='Remove link'
          disabled={!url && !isActive}
          variant='ghost'
          className='we:text-foreground/80'
          size={'icon'}
        >
          <Trash2Icon />
        </Button>
      </ButtonGroup>
    </div>
  );
};
