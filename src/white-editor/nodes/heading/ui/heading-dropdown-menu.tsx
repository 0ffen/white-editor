import * as React from 'react';

import { ChevronDownIcon } from 'lucide-react';
import { getTranslate } from '@/shared';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  Button,
  type ButtonProps,
  DropdownMenuGroup,
} from '@/shared/components';
import { useTiptapEditor } from '@/shared/hooks';
import { cn } from '@/shared/utils';
import {
  useHeading,
  useHeadingDropdownMenu,
  type UseHeadingDropdownMenuConfig,
  type HeadingOption,
} from '@/white-editor';
import type { Editor } from '@tiptap/react';

export interface HeadingDropdownMenuProps extends Omit<ButtonProps, 'type'>, UseHeadingDropdownMenuConfig {
  onOpenChange?: (isOpen: boolean) => void;
  options?: HeadingOption[];
  triggerClassName?: string;
  contentClassName?: string;
  itemClassName?: string;
  sideOffset?: number;
  icon?: React.ReactNode;
}

const defaultHeadingOptions: HeadingOption[] = [
  { label: '제목 1', level: 1 },
  { label: '제목 2', level: 2 },
  { label: '제목 3', level: 3 },
  { label: '제목 4', level: 4 },
  { label: '본문 1', level: null, paragraphVariant: 1 },
  { label: '본문 2', level: null, paragraphVariant: 2 },
];

interface HeadingCheckboxItemProps {
  editor: Editor | null;
  option: HeadingOption;
  className?: string;
  onSelect?: (label: string) => void;
}

function HeadingCheckboxItem({ editor, option, className, onSelect }: HeadingCheckboxItemProps) {
  const { isActive, handleToggle, canToggle } = useHeading({
    editor,
    level: option.level,
    paragraphVariant: option.paragraphVariant,
  });

  const handleCheckedChange = React.useCallback(() => {
    handleToggle();
    onSelect?.(option.label);
  }, [handleToggle, onSelect, option.label]);

  return (
    <DropdownMenuCheckboxItem
      checked={isActive}
      onCheckedChange={handleCheckedChange}
      disabled={!canToggle}
      className={className}
    >
      {option.label}
    </DropdownMenuCheckboxItem>
  );
}

// Helper to get current active option label
function useCurrentLabel(editor: Editor | null, options: HeadingOption[]): string {
  // Default to 본문 1 (first paragraph option with variant 1)
  const defaultLabel = options.find((opt) => opt.level === null && opt.paragraphVariant === 1)?.label ?? '본문 1';
  const [currentLabel, setCurrentLabel] = React.useState<string>(defaultLabel);

  React.useEffect(() => {
    if (!editor) return;

    const updateLabel = () => {
      // Check headings first
      for (const option of options) {
        if (option.level !== null && editor.isActive('heading', { level: option.level })) {
          setCurrentLabel(option.label);
          return;
        }
      }

      // Check paragraph variants
      if (editor.isActive('paragraph')) {
        const currentVariant = editor.getAttributes('paragraph').variant ?? 1;
        const paragraphOption = options.find((opt) => opt.level === null && opt.paragraphVariant === currentVariant);
        if (paragraphOption) {
          setCurrentLabel(paragraphOption.label);
          return;
        }
        // Default to first paragraph option if variant doesn't match
        const defaultParagraph = options.find((opt) => opt.level === null);
        if (defaultParagraph) {
          setCurrentLabel(defaultParagraph.label);
        }
      }
    };

    updateLabel();
    editor.on('selectionUpdate', updateLabel);
    editor.on('transaction', updateLabel);
    return () => {
      editor.off('selectionUpdate', updateLabel);
      editor.off('transaction', updateLabel);
    };
  }, [editor, options]);

  return currentLabel;
}

export const HeadingDropdownMenu = React.forwardRef<HTMLButtonElement, HeadingDropdownMenuProps>(
  (
    {
      editor: providedEditor,
      options,
      hideWhenUnavailable = false,
      onOpenChange,
      triggerClassName,
      contentClassName,
      itemClassName,
      sideOffset,
      icon,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const [isOpen, setIsOpen] = React.useState(false);
    const [userSelectedLabel, setUserSelectedLabel] = React.useState<string | null>(null);
    const { isVisible, canToggle } = useHeadingDropdownMenu({
      editor,
      hideWhenUnavailable,
    });

    const resolvedOptions = options ?? defaultHeadingOptions;
    const currentLabel = useCurrentLabel(editor, resolvedOptions);

    // 사용자가 직접 선택한 경우에만 버튼 활성화
    const isActive = userSelectedLabel !== null && currentLabel === userSelectedLabel;

    const handleOpenChange = React.useCallback(
      (open: boolean) => {
        if (!editor || !canToggle) return;
        setIsOpen((prev) => !prev);
        onOpenChange?.(open);
      },
      [canToggle, editor, onOpenChange]
    );

    const handleItemSelect = React.useCallback((label: string) => {
      setUserSelectedLabel(label);
    }, []);

    if (!isVisible) {
      return null;
    }

    return (
      <DropdownMenu modal open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            type='button'
            data-active-state={isActive ? 'on' : 'off'}
            role='button'
            tabIndex={-1}
            disabled={!canToggle}
            data-disabled={!canToggle}
            aria-label='heading dropdown menu'
            aria-pressed={isActive}
            tooltip={getTranslate('heading')}
            isActive={isActive}
            className={cn('we:h-[28px] we:gap-1 we:px-2 we:select-none', triggerClassName)}
            {...buttonProps}
            ref={ref}
          >
            {icon}
            <span className='we:text-sm'>{currentLabel}</span>
            <ChevronDownIcon className='we:text-text-light we:size-3' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align='start'
          className={cn('w-fit min-w-[128px]', contentClassName)}
          sideOffset={sideOffset}
        >
          <DropdownMenuGroup>
            {resolvedOptions.map((option) => (
              <HeadingCheckboxItem
                key={`${option.level}-${option.paragraphVariant ?? ''}`}
                editor={editor}
                option={option}
                className={itemClassName}
                onSelect={handleItemSelect}
              />
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);

HeadingDropdownMenu.displayName = 'HeadingDropdownMenu';
