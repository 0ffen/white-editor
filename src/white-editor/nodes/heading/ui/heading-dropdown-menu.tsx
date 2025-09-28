import * as React from 'react';

import { ChevronDownIcon } from 'lucide-react';
import TextSizeIcon from '@/assets/icons/text-size.svg?react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Button,
  type ButtonProps,
} from '@/shared/components';
import { useTiptapEditor } from '@/shared/hooks';
import { cn } from '@/shared/utils';
import {
  HeadingButton,
  useHeadingDropdownMenu,
  type UseHeadingDropdownMenuConfig,
  type HeadingOption,
} from '@/white-editor';

export interface HeadingDropdownMenuProps extends Omit<ButtonProps, 'type'>, UseHeadingDropdownMenuConfig {
  onOpenChange?: (isOpen: boolean) => void;
  options?: HeadingOption[];
  triggerClassName?: string;
  contentClassName?: string;
  itemButtonClassName?: string;
  itemTextClassName?: string;
  iconClassName?: string;
  sideOffset?: number;
  icon?: React.ReactNode;
}

const defaultHeadingOptions: HeadingOption[] = [
  { label: 'Normal Text', level: null },
  { label: 'Heading 1', level: 1 },
  { label: 'Heading 2', level: 2 },
  { label: 'Heading 3', level: 3 },
];

export const HeadingDropdownMenu = React.forwardRef<HTMLButtonElement, HeadingDropdownMenuProps>(
  (
    {
      editor: providedEditor,
      options,
      hideWhenUnavailable = false,
      onOpenChange,
      triggerClassName,
      contentClassName,
      itemButtonClassName,
      itemTextClassName,
      sideOffset,
      icon,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const [isOpen, setIsOpen] = React.useState(false);
    const { isVisible, isActive, canToggle } = useHeadingDropdownMenu({
      editor,
      hideWhenUnavailable,
    });

    const handleOpenChange = React.useCallback(
      (open: boolean) => {
        if (!editor || !canToggle) return;
        setIsOpen((prev) => !prev);
        onOpenChange?.(open);
      },
      [canToggle, editor, onOpenChange]
    );

    if (!isVisible) {
      return null;
    }

    if (!options) {
      options = defaultHeadingOptions;
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
            isActive={isActive}
            className={cn('gap-1 [&_svg:nth-child(1)]:size-4 [&_svg:nth-child(2)]:size-3', triggerClassName)}
            {...buttonProps}
            ref={ref}
          >
            {icon || <TextSizeIcon />}
            <ChevronDownIcon className='text-muted-foreground size-2' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='start' className={cn('w-fit', contentClassName)} sideOffset={sideOffset}>
          {options.map((option) => (
            <DropdownMenuItem key={`${option.level}`} asChild>
              <HeadingButton
                level={option.level}
                editor={editor}
                text={`${option.label}`}
                itemButtonClassName={cn(itemButtonClassName)}
                itemTextClassName={cn(itemTextClassName)}
              />
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);

HeadingDropdownMenu.displayName = 'HeadingDropdownMenu';
