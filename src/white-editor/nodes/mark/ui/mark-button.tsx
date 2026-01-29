import * as React from 'react';

import { getTranslate } from '@/shared';
import { Button, type ButtonProps } from '@/shared/components';
import { useTiptapEditor } from '@/shared/hooks';
import { cn } from '@/shared/utils';
import { useMark, type UseMarkConfig } from '@/white-editor';

export interface MarkButtonProps extends Omit<ButtonProps, 'type'>, UseMarkConfig {
  icon?: React.ReactNode;
  className?: string;
}

export const MarkButton = React.forwardRef<HTMLButtonElement, MarkButtonProps>(
  (
    {
      editor: providedEditor,
      type,
      hideWhenUnavailable = false,
      onToggled,
      onClick,
      children,
      className,
      icon,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const {
      isVisible,
      handleMark,
      label,
      canToggle,
      isActive,
      Icon: defaultIcon,
    } = useMark({
      editor,
      type,
      hideWhenUnavailable,
      onToggled,
    });

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        handleMark();
      },
      [handleMark, onClick]
    );

    if (!isVisible) {
      return null;
    }

    const RenderIcon = icon || (defaultIcon && React.createElement(defaultIcon));

    return (
      <Button
        type='button'
        size='icon'
        variant={'ghost'}
        disabled={!canToggle}
        data-active-state={isActive ? 'on' : 'off'}
        data-disabled={!canToggle}
        role='button'
        tabIndex={-1}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={getTranslate(type)}
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

MarkButton.displayName = 'MarkButton';
