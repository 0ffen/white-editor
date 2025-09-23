import * as React from 'react';

import { useHeading, type UseHeadingConfig } from '@/editor';
import { Button, type ButtonProps } from '@/shared/components';
import { useTiptapEditor } from '@/shared/hooks';
import { cn } from '@/shared/utils';

export interface HeadingButtonProps extends Omit<ButtonProps, 'type'>, UseHeadingConfig {
  text?: string;
  itemButtonClassName?: string;
  itemTextClassName?: string;
}

export const HeadingButton = React.forwardRef<HTMLButtonElement, HeadingButtonProps>(
  (
    {
      editor: providedEditor,
      itemTextClassName,
      itemButtonClassName,
      level,
      text,
      hideWhenUnavailable = false,
      onToggled,
      onClick,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const { isVisible, canToggle, isActive, handleToggle, label } = useHeading({
      editor,
      level,
      hideWhenUnavailable,
      onToggled,
    });

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        handleToggle();
      },
      [handleToggle, onClick]
    );

    if (!isVisible) {
      return null;
    }

    return (
      <Button
        type='button'
        data-style='ghost'
        data-active-state={isActive ? 'on' : 'off'}
        role='button'
        tabIndex={-1}
        disabled={!canToggle}
        data-disabled={!canToggle}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={label}
        onClick={handleClick}
        justify='start'
        className={cn(itemButtonClassName)}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>{text && <span className={cn('text-foreground/80 font-medium', itemTextClassName)}>{text}</span>}</>
        )}
      </Button>
    );
  }
);

HeadingButton.displayName = 'HeadingButton';
