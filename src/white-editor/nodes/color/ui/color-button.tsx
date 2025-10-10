import * as React from 'react';
import { Button, type ButtonProps } from '@/shared/components';
import { useTiptapEditor } from '@/shared/hooks';
import { cn } from '@/shared/utils';
import { useTextColor, type UseTextColorConfig } from '@/white-editor';

export interface TextColorButtonProps extends Omit<ButtonProps, 'type'>, UseTextColorConfig {
  text?: string;
}

export const TextColorButton = React.forwardRef<HTMLButtonElement, TextColorButtonProps>(
  (
    {
      editor: providedEditor,
      textColor,
      text,
      hideWhenUnavailable = false,
      onApplied,
      onClick,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const { isVisible, canTextColor, isActive, handleTextColor, label } = useTextColor({
      editor,
      textColor,
      label: text || `Toggle text (${textColor?.value})`,
      hideWhenUnavailable,
      onApplied,
    });

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        handleTextColor();
      },
      [handleTextColor, onClick]
    );

    if (!isVisible) {
      return null;
    }

    return (
      <Button
        type='button'
        size={'icon'}
        data-style='ghost'
        data-active-state={isActive ? 'on' : 'off'}
        role='button'
        tabIndex={-1}
        disabled={!canTextColor}
        data-disabled={!canTextColor}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={label}
        isActive={isActive}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
        className='we:h-6 we:w-6'
      >
        {children ?? (
          <span
            className={cn('we:h-full we:w-full we:rounded-4xl we:border')}
            style={{ backgroundColor: textColor?.value, borderColor: textColor?.border } as React.CSSProperties}
          />
        )}
      </Button>
    );
  }
);

TextColorButton.displayName = 'TextColorButton';
