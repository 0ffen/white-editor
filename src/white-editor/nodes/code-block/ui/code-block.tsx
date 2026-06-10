import React from 'react';
import { CheckIcon, ChevronDownIcon, Code2, Copy, Workflow } from 'lucide-react';
import { useTranslate } from '@/shared';
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
import { MermaidDiagram } from './mermaid-diagram';

const MERMAID_LANGUAGE = 'mermaid';

interface Props {
  node: {
    attrs: { language: string };
    textContent: string;
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
    storage: Record<string, Record<string, unknown>>;
  };
}

export const CodeBlock = ({
  node: {
    attrs: { language: defaultLanguage },
    textContent,
  },
  updateAttributes,
  extension,
  editor,
}: Props) => {
  const t = useTranslate();
  const [isCopied, setIsCopied] = React.useState<boolean>(false);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const preRef = React.useRef<HTMLPreElement>(null);

  const isMermaid = defaultLanguage === MERMAID_LANGUAGE;
  // mermaid일 때 코드/다이어그램 보기 전환 (기본값: 다이어그램)
  const [showSource, setShowSource] = React.useState<boolean>(false);

  // 다이어그램/코드 표시 여부: 에디터·뷰어 모두 토글(showSource) 상태에 따른다 (기본값: 다이어그램)
  const renderDiagram = isMermaid && !showSource;

  const languageOptions = React.useMemo(() => {
    const languages = extension.options.lowlight.listLanguages().map((lang) => ({
      label: lang,
      value: lang,
    }));

    const withMermaid = [{ label: MERMAID_LANGUAGE, value: MERMAID_LANGUAGE }, ...languages];

    if (!defaultLanguage) return withMermaid;

    // 선택된 언어를 맨 위로
    const selectedIndex = withMermaid.findIndex((lang) => lang.value === defaultLanguage);
    if (selectedIndex > 0) {
      const [selected] = withMermaid.splice(selectedIndex, 1);
      withMermaid.unshift(selected);
    }

    return withMermaid;
  }, [extension.options.lowlight, defaultLanguage]);

  const handleCopy = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const onCopy = editor.storage?.codeBlock?.onCopy as ((code: string) => void) | undefined;

      const code = preRef.current?.textContent || '';
      setIsCopied(true);

      if (onCopy) {
        onCopy(code);
      } else {
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(code);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = code;
          textarea.style.position = 'fixed';
          textarea.style.left = '-9999px';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
      }

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    },
    [editor.storage]
  );

  return (
    <NodeViewWrapper>
      <pre className='hljs we:mt-5 we:mb-0'>
        <div
          className={cn('we:relative we:w-full', editor.isEditable || isMermaid ? 'we:flex we:justify-between' : '')}
        >
          {(editor.isEditable || isMermaid) && (
            <div className='we:flex we:items-center we:gap-1'>
              {editor.isEditable && (
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type='button'
                      variant='ghost'
                      role='combobox'
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        'we:text-text-light we:w-fit we:gap-1 we:justify-between we:cursor-pointer we:hover:bg-interaction-hover'
                      )}
                    >
                      {defaultLanguage || 'Plain text'}
                      <ChevronDownIcon className='we:size-3 we:text-text-light' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className='we:w-[160px] we:p-0 we:bg-elevation-dropdown we:shadow-popover we:rounded-sm we:overflow-hidden'
                    align='start'
                  >
                    <Command>
                      <CommandInput placeholder={t('검색')} iconPosition='right' />
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

              {isMermaid && (
                <Button
                  type='button'
                  variant='ghost'
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSource((prev) => !prev);
                  }}
                  className='we:text-text-light we:w-fit we:gap-1 we:cursor-pointer we:hover:bg-interaction-hover'
                >
                  {showSource ? (
                    <>
                      <Workflow className='we:size-3.5' />
                      {t('다이어그램')}
                    </>
                  ) : (
                    <>
                      <Code2 className='we:size-3.5' />
                      {t('코드')}
                    </>
                  )}
                </Button>
              )}
            </div>
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
        {renderDiagram && <MermaidDiagram code={textContent} zoomable={!editor.isEditable} />}
        {/* ProseMirror가 콘텐츠를 관리하도록 NodeViewContent는 항상 마운트하고, 다이어그램 표시 중에는 숨긴다 */}
        <code ref={preRef} className={cn('we:block we:pr-10 we:py-3 we:px-4', renderDiagram && 'we:hidden')}>
          <NodeViewContent as='div' />
        </code>
      </pre>
    </NodeViewWrapper>
  );
};
