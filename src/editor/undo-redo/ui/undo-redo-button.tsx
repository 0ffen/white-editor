import * as React from 'react';

import { Button, type ButtonProps } from '@/components';
import { useUndoRedo, type UseUndoRedoConfig } from '@/editor';
import { useTiptapEditor } from '@/hooks/use-tiptap-editor';
import { cn } from '@/utils';

export interface UndoRedoButtonProps extends Omit<ButtonProps, 'type'>, UseUndoRedoConfig {
  icon?: React.ReactNode;
  className?: string;
}

export const UndoRedoButton = React.forwardRef<HTMLButtonElement, UndoRedoButtonProps>(
  (
    {
      editor: providedEditor,
      action,
      icon,
      className,
      hideWhenUnavailable = false,
      onExecuted,

      onClick,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const {
      isVisible,
      handleAction,
      label,
      canExecute,
      Icon: defaultIcon,
    } = useUndoRedo({
      editor,
      action,
      hideWhenUnavailable,
      onExecuted,
    });

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        handleAction();
      },
      [handleAction, onClick]
    );

    if (!isVisible) {
      return null;
    }

    const RenderIcon = icon || (defaultIcon && React.createElement(defaultIcon));

    return (
      <Button
        type='button'
        disabled={!canExecute}
        data-style='ghost'
        data-disabled={!canExecute}
        role='button'
        tabIndex={-1}
        aria-label={label}
        tooltip={label}
        onClick={handleClick}
        className={cn(className)}
        {...buttonProps}
        ref={ref}
      >
        {children ?? <>{RenderIcon}</>}
      </Button>
    );
  }
);

UndoRedoButton.displayName = 'UndoRedoButton';
