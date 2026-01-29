import * as React from 'react';

import { getTranslate } from '@/shared';
import { Button, type ButtonProps } from '@/shared/components';
import { useTiptapEditor } from '@/shared/hooks/use-tiptap-editor';
import { cn } from '@/shared/utils';
import { useUndoRedo, type UseUndoRedoConfig } from '@/white-editor';

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
        size='icon'
        disabled={!canExecute}
        data-style='ghost'
        data-disabled={!canExecute}
        role='button'
        tabIndex={-1}
        aria-label={label}
        tooltip={getTranslate(action)}
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
