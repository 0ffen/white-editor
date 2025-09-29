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
    setIsCopied(true);
    navigator.clipboard.writeText(preRef.current?.textContent || '');

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }, []);

  return (
    <NodeViewWrapper>
      <pre className='hljs'>
        <div className={cn('relative w-full', editor.isEditable ? 'flex justify-between' : '')}>
          {editor.isEditable && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='ghost'
                  role='combobox'
                  className={cn(
                    'text-muted-foreground/50 hover:text-muted-foreground/80 w-fit justify-between hover:bg-transparent'
                  )}
                >
                  {defaultLanguage || 'Select language'}
                  <ChevronsUpDown className='opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-[180px] p-0' align='start'>
                <Command>
                  <CommandInput placeholder='Search language' className='h-9' />
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
                            className={cn('ml-auto', language.value === defaultLanguage ? 'opacity-100' : 'opacity-0')}
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
            className='absolute -top-1 -right-1 w-fit hover:cursor-pointer hover:bg-stone-800'
          >
            {isCopied ? (
              <Check className='text-muted-foreground/50 size-4' />
            ) : (
              <Copy className='text-muted-foreground/50 size-4' />
            )}
          </Button>
        </div>
        <code ref={preRef} className='block pr-10'>
          <NodeViewContent as='div' />
        </code>
      </pre>
    </NodeViewWrapper>
  );
};
