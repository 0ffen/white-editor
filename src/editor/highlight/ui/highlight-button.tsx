import * as React from 'react';
import { useColorHighlight, type UseColorHighlightConfig } from '@/editor';
import { Button, type ButtonProps } from '@/shared/components';
import { useTiptapEditor } from '@/shared/hooks';
import { cn } from '@/shared/utils';

export interface HighlightColorButtonProps extends Omit<ButtonProps, 'type'>, UseColorHighlightConfig {
  text?: string;
}

export const HighlightColorButton = React.forwardRef<HTMLButtonElement, HighlightColorButtonProps>(
  (
    {
      editor: providedEditor,
      highlightColor,
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
    const { isVisible, canColorHighlight, isActive, handleColorHighlight, label } = useColorHighlight({
      editor,
      highlightColor,
      label: text || `Toggle highlight (${highlightColor})`,
      hideWhenUnavailable,
      onApplied,
    });

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        handleColorHighlight();
      },
      [handleColorHighlight, onClick]
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
        disabled={!canColorHighlight}
        data-disabled={!canColorHighlight}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={label}
        isActive={isActive}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
        className='h-6 w-6'
      >
        {children ?? (
          <span
            className={cn('h-full w-full rounded-4xl border')}
            style={
              { backgroundColor: highlightColor?.value, borderColor: highlightColor?.border } as React.CSSProperties
            }
          />
        )}
      </Button>
    );
  }
);

HighlightColorButton.displayName = 'HighlightColorButton';
