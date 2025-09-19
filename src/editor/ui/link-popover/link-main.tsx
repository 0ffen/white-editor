import { Button, Input } from '@/components';

export interface LinkMainProps {
  url: string;
  setUrl: React.Dispatch<React.SetStateAction<string | null>>;
  setLink: () => void;
  removeLink: () => void;
  isActive: boolean;
  placeholder?: string;
  confirmText?: string;
}

export const LinkMain: React.FC<LinkMainProps> = ({
  url,
  setUrl,
  setLink,
  removeLink,
  placeholder,
  isActive,
  confirmText,
}: LinkMainProps) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setLink();
    }
  };

  return (
    <div className={'flex flex-col gap-2'}>
      <Input
        type='url'
        placeholder={placeholder}
        value={url}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
        onKeyDown={handleKeyDown}
        autoComplete='off'
        autoCorrect='off'
        autoCapitalize='off'
      />
      <Button type='button' onClick={setLink} title='확인 버튼' disabled={!url && !isActive}>
        {confirmText || '확인'}
      </Button>
    </div>
  );
};
