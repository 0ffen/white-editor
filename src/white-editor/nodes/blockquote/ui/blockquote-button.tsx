import * as React from 'react';

import { useTranslate } from '@/shared';
import { Button, type ButtonProps } from '@/shared/components';
import { useTiptapEditor } from '@/shared/hooks';
import { cn } from '@/shared/utils';
import { useBlockquote, type UseBlockquoteConfig } from '@/white-editor';

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
    const t = useTranslate();
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
        size='icon'
        variant='ghost'
        data-style='ghost'
        data-active-state={isActive ? 'on' : 'off'}
        role='button'
        tabIndex={-1}
        disabled={!canToggle}
        data-disabled={!canToggle}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={t('blockquote')}
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
