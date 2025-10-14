import React from 'react';
import { Check, ChevronsUpDown, Copy } from 'lucide-react';
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
  const preRef = React.useRef<HTMLPreElement>(null);

  const languageOptions = extension.options.lowlight.listLanguages().map((lang) => ({
    label: lang,
    value: lang,
  }));

  const handleCopy = React.useCallback(() => {
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
      <pre className='hljs'>
        <div className={cn('we:relative we:w-full', editor.isEditable ? 'we:flex we:justify-between' : '')}>
          {editor.isEditable && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='ghost'
                  role='combobox'
                  className={cn(
                    'we:text-muted-foreground/50 we:hover:text-muted-foreground/80 we:w-fit we:justify-between we:hover:bg-transparent'
                  )}
                >
                  {defaultLanguage || 'Select language'}
                  <ChevronsUpDown className='we:opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='we:w-[180px] we:p-0' align='start'>
                <Command>
                  <CommandInput placeholder='Search language' className='we:h-9' />
                  <CommandList>
                    <CommandEmpty>No language found</CommandEmpty>
                    <CommandGroup>
                      {languageOptions.map((language) => (
                        <CommandItem
                          value={language.label}
                          key={language.value}
                          onSelect={() => {
                            updateAttributes({ language: language.value });
                          }}
                        >
                          {language.label}
                          <Check
                            className={cn(
                              'we:ml-auto',
                              language.value === defaultLanguage ? 'we:opacity-100' : 'we:opacity-0'
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
          <Button
            onClick={handleCopy}
            variant='ghost'
            className='we:absolute we:-top-1 we:-right-1 we:w-fit we:hover:cursor-pointer we:hover:bg-stone-800'
          >
            {isCopied ? (
              <Check className='we:text-muted-foreground/50 we:size-4' />
            ) : (
              <Copy className='we:text-muted-foreground/50 we:size-4' />
            )}
          </Button>
        </div>
        <code ref={preRef} className='we:block we:pr-10'>
          <NodeViewContent as='div' />
        </code>
      </pre>
    </NodeViewWrapper>
  );
};
