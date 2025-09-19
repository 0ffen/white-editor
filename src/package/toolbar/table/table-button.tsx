import * as React from 'react';

import { Button, type ButtonProps } from '@/components';
import { useTiptapEditor } from '@/hooks';
import { cn } from '@/utils';
import { useTable, type UseTableConfig } from './use-table';

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

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        handleTable();
      },
      [handleTable, onClick]
    );

    if (!isVisible) {
      return null;
    }

    const RenderIcon = icon || (defaultIcon && React.createElement(defaultIcon));

    return (
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
        tooltip={label}
        onClick={handleClick}
        isActive={isActive}
        className={cn(className)}
        {...buttonProps}
        ref={ref}
      >
        {children ?? <>{RenderIcon}</>}
      </Button>
    );
  }
);

TableButton.displayName = 'TableButton';
