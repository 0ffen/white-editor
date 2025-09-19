import * as React from 'react';

import { Button, type ButtonProps } from '@/components';
import { useTiptapEditor } from '@/hooks/use-tiptap-editor';
import { cn } from '@/utils';
import { useCodeBlock, type UseCodeBlockConfig } from './use-code-block';

export interface CodeBlockButtonProps extends Omit<ButtonProps, 'type'>, UseCodeBlockConfig {
  icon?: React.ReactNode;
  className?: string;
}

export const CodeBlockButton = React.forwardRef<HTMLButtonElement, CodeBlockButtonProps>(
  (
    {
      editor: providedEditor,
      icon,
      className,
      hideWhenUnavailable = false,
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
    } = useCodeBlock({
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
        disabled={!canToggle}
        data-disabled={!canToggle}
        tabIndex={-1}
        aria-label={label}
        aria-pressed={isActive}
        onClick={handleClick}
        className={cn(className)}
        isActive={isActive}
        ref={ref}
        {...buttonProps}
      >
        {children ?? <>{RenderIcon}</>}
      </Button>
    );
  }
);

CodeBlockButton.displayName = 'CodeBlockButton';
