import * as React from 'react';

import { Button, type ButtonProps } from '@/components';
import { useBlockquote, type UseBlockquoteConfig } from '@/editor';
import { useTiptapEditor } from '@/hooks';
import { cn } from '@/utils';

export interface BlockquoteButtonProps extends Omit<ButtonProps, 'type'>, UseBlockquoteConfig {
  className?: string;
  icon?: React.ReactNode;
}

export const BlockquoteButton = React.forwardRef<HTMLButtonElement, BlockquoteButtonProps>(
  (
    {
      editor: providedEditor,
      className,
      hideWhenUnavailable = false,
      icon,
      onToggled,
      onClick,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const {
      isVisible,
      canToggle,
      isActive,
      handleToggle,
      label,
      Icon: defaultIcon,
    } = useBlockquote({
      editor,
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

    const RenderIcon = icon || (defaultIcon && React.createElement(defaultIcon));

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
        tooltip='Blockquote'
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

BlockquoteButton.displayName = 'BlockquoteButton';
