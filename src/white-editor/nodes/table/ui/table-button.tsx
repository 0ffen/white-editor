import * as React from 'react';
import { ChevronDownIcon } from 'lucide-react';

import { getTranslate } from '@/shared';
import { Button, type ButtonProps, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/shared/components';
import { useTiptapEditor } from '@/shared/hooks';
import { cn } from '@/shared/utils';
import { useTable, type UseTableConfig, tableActions, TableToolbar } from '@/white-editor';

export interface TableButtonProps extends Omit<ButtonProps, 'type'>, UseTableConfig {
  icon?: React.ReactNode;
  className?: string;
}

export const TableButton = React.forwardRef<HTMLButtonElement, TableButtonProps>(
  (
    {
      editor: providedEditor,
      icon,
      className,
      hideWhenUnavailable = false,
      onInserted,
      onClick,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const {
      isVisible,
      canInsert,
      isActive,
      handleTable,
      label,
      Icon: defaultIcon,
    } = useTable({
      editor,
      hideWhenUnavailable,
      onInserted,
    });

    const [dropdownOpen, setDropdownOpen] = React.useState<boolean>(false);

    const handleDropdownOpenChange = React.useCallback((open: boolean) => {
      setDropdownOpen(open);
    }, []);

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (isActive) {
          setDropdownOpen((prev) => !prev);
        } else {
          handleTable();
        }
      },
      [handleTable, onClick, isActive]
    );

    if (!isVisible) {
      return null;
    }

    const RenderIcon = icon || (defaultIcon && React.createElement(defaultIcon));

    return (
      <DropdownMenu open={dropdownOpen && isActive} onOpenChange={handleDropdownOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            type='button'
            data-style='ghost'
            data-active-state={isActive ? 'on' : 'off'}
            role='button'
            tabIndex={-1}
            disabled={!canInsert}
            data-disabled={!canInsert}
            aria-label={label}
            aria-pressed={isActive}
            tooltip={getTranslate('table')}
            onClick={handleClick}
            isActive={isActive}
            className={cn('we:gap-0.5', className)}
            {...buttonProps}
            ref={ref}
          >
            {children ?? <>{RenderIcon}</>}
            {isActive && <ChevronDownIcon className='we:text-muted-foreground we:size-3' />}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='start' className={cn('w-fit')}>
          <TableToolbar editor={editor} options={tableActions} hideWhenUnavailable={hideWhenUnavailable} />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);

TableButton.displayName = 'TableButton';
