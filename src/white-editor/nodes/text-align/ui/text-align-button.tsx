import * as React from 'react';

import { useTranslate } from '@/shared';
import { Button, type ButtonProps } from '@/shared/components';
import { useTiptapEditor } from '@/shared/hooks';
import { cn } from '@/shared/utils';
import { useTextAlign, type UseTextAlignConfig } from '@/white-editor';

export interface TextAlignButtonProps extends Omit<ButtonProps, 'type'>, UseTextAlignConfig {
  className?: string;
  icon?: React.ReactNode;
}

export const TextAlignButton = React.forwardRef<HTMLButtonElement, TextAlignButtonProps>(
  (
    {
      editor: providedEditor,
      align,
      className,
      hideWhenUnavailable = false,
      onAligned,
      onClick,
      icon,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const t = useTranslate();
    const {
      isVisible,
      handleTextAlign,
      label,
      canAlign,
      isActive,
      Icon: defaultIcon,
    } = useTextAlign({
      editor,
      align,
      hideWhenUnavailable,
      onAligned,
    });

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        handleTextAlign();
      },
      [handleTextAlign, onClick]
    );

    if (!isVisible) {
      return null;
    }

    const RenderIcon = icon || (defaultIcon && React.createElement(defaultIcon));

    return (
      <Button
        type='button'
        size='icon'
        disabled={!canAlign}
        data-style='ghost'
        data-active-state={isActive ? 'on' : 'off'}
        data-disabled={!canAlign}
        role='button'
        tabIndex={-1}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={align != null ? t(`textAlign${align.charAt(0).toUpperCase() + align.slice(1)}`) : undefined}
        isActive={isActive}
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

TextAlignButton.displayName = 'TextAlignButton';
