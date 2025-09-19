import { CornerDownLeft, TrashIcon } from 'lucide-react';
import { Button, ButtonGroup, Input, Separator } from '@/components';
import { cn } from '@/utils';

export interface LinkMainProps {
  url: string;
  setUrl: React.Dispatch<React.SetStateAction<string | null>>;
  setLink: () => void;
  removeLink: () => void;
  isActive: boolean;
  placeholder?: string;
  confirmText?: string;
  label?: string;
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
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setLink();
    }
  };

  return (
    <div className={cn('flex w-full items-start gap-1', linkPopoverClassName)}>
      <div className='flex w-full gap-1'>
        <Input
          type='url'
          placeholder={placeholder || '링크를 입력해주세요.'}
          value={url}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete='off'
          autoCorrect='off'
          autoCapitalize='off'
          className='w-full'
        />
        <ButtonGroup orientation='horizontal'>
          <Button type='button' onClick={setLink} disabled={!url && !isActive}>
            <CornerDownLeft />
          </Button>
          <Separator orientation='vertical' />
          <Button type='button' onClick={removeLink} title='Remove link' disabled={!url && !isActive} variant='ghost'>
            <TrashIcon />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
};
