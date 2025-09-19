import * as React from 'react';
import '@tailwindcss/typography';

import { ChevronDownIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Button,
  type ButtonProps,
} from '@/components';

import { useTiptapEditor } from '@/hooks';
import { cn } from '@/utils/utils';
import { HeadingButton } from '../heading-button';
import { useHeadingDropdownMenu, type UseHeadingDropdownMenuConfig } from './use-heading-dropdown-menu';
import type { HeadingOption } from '../heading.type';

export interface HeadingDropdownMenuProps extends Omit<ButtonProps, 'type'>, UseHeadingDropdownMenuConfig {
  onOpenChange?: (isOpen: boolean) => void;
  options: HeadingOption[];
  triggerClassName?: string;
  contentClassName?: string;
  itemButtonClassName?: string;
  itemTextClassName?: string;
  iconClassName?: string;
  sideOffset?: number;
}

export const HeadingDropdownMenu = React.forwardRef<HTMLButtonElement, HeadingDropdownMenuProps>(
  (
    {
      editor: providedEditor,
      options,
      hideWhenUnavailable = false,
      onOpenChange,
      triggerClassName,
      iconClassName,
      contentClassName,
      itemButtonClassName,
      itemTextClassName,
      sideOffset,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const [isOpen, setIsOpen] = React.useState(false);
    const { isVisible, isActive, canToggle, activeLevel } = useHeadingDropdownMenu({
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

    const displayLabel = options.find((option) => option.level === activeLevel)?.label || options[0]?.label;

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
            className={cn(triggerClassName)}
            {...buttonProps}
            ref={ref}
          >
            <span>{displayLabel}</span>
            <ChevronDownIcon className={cn(iconClassName)} />
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
