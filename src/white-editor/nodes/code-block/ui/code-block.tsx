import React from 'react';
import { CheckIcon, ChevronDownIcon, Copy } from 'lucide-react';
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components';
import { cn } from '@/shared/utils';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';

import '@/shared/styles/github-dark.css';

interface Props {
  node: {
    attrs: { language: string };
  };
  updateAttributes: (attrs: { language: string }) => void;
  extension: {
    options: {
      lowlight: {
        listLanguages: () => string[];
      };
    };
  };
  editor: {
    isEditable: boolean;
  };
}

export const CodeBlock = ({
  node: {
    attrs: { language: defaultLanguage },
  },
  updateAttributes,
  extension,
  editor,
}: Props) => {
  const [isCopied, setIsCopied] = React.useState<boolean>(false);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const preRef = React.useRef<HTMLPreElement>(null);

  // 선택된 언어를 맨 위로 정렬
  const languageOptions = React.useMemo(() => {
    const languages = extension.options.lowlight.listLanguages().map((lang) => ({
      label: lang,
      value: lang,
    }));

    if (!defaultLanguage) return languages;

    // 선택된 언어를 맨 위로
    const selectedIndex = languages.findIndex((lang) => lang.value === defaultLanguage);
    if (selectedIndex > 0) {
      const [selected] = languages.splice(selectedIndex, 1);
      languages.unshift(selected);
    }

    return languages;
  }, [extension.options.lowlight, defaultLanguage]);

  const handleCopy = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    // CSR 환경에서만 clipboard API 사용
    if (typeof window === 'undefined' || !navigator.clipboard) {
      return;
    }

    setIsCopied(true);
    navigator.clipboard.writeText(preRef.current?.textContent || '');

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }, []);

  return (
    <NodeViewWrapper>
      <pre className='hljs we:mt-5 we:mb-0'>
        <div className={cn('we:relative we:w-full', editor.isEditable ? 'we:flex we:justify-between' : '')}>
          {editor.isEditable && (
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  role='combobox'
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen((prev) => !prev);
                  }}
                  className={cn(
                    'we:text-text-light we:w-fit we:gap-1 we:justify-between we:cursor-pointer we:hover:bg-interaction-hover'
                  )}
                >
                  {defaultLanguage || 'Plain text'}
                  <ChevronDownIcon className='we:size-3 we:text-text-light' />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className='we:w-[160px] we:p-0 we:bg-elevation-dropdown we:rounded-sm we:overflow-hidden'
                align='start'
                style={{ boxShadow: 'var(--we-popover-shadow)' }}
              >
                <Command>
                  <CommandInput placeholder='Search' iconPosition='right' />
                  <CommandList className='we:p-[6px]'>
                    <CommandEmpty>No language found</CommandEmpty>
                    <CommandGroup>
                      {languageOptions.map((language) => (
                        <CommandItem
                          value={language.label}
                          key={language.value}
                          onSelect={() => {
                            updateAttributes({ language: language.value });
                            setIsOpen(false);
                          }}
                          className='we:pr-8 we:relative'
                        >
                          {language.label}
                          {language.value === defaultLanguage && (
                            <CheckIcon className='we:absolute we:right-2 we:size-5 we:text-brand-default' />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
          <Button
            type='button'
            onClick={handleCopy}
            variant='ghost'
            className='we:absolute we:top-0 we:right-0 we:w-fit we:hover:cursor-pointer we:hover:bg-interaction-hover'
          >
            {isCopied ? (
              <CheckIcon className='we:text-text-light we:size-4' />
            ) : (
              <Copy className='we:text-text-light we:size-4' />
            )}
          </Button>
        </div>
        <code ref={preRef} className='we:block we:pr-10 we:py-3 we:px-4'>
          <NodeViewContent as='div' />
        </code>
      </pre>
    </NodeViewWrapper>
  );
};
