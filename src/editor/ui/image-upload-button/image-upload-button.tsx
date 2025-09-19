import * as React from 'react';

import { Button, type ButtonProps } from '@/components';
import { useTiptapEditor } from '@/hooks';
import { useImageUpload, type UseImageUploadConfig } from './use-image-upload';

export interface ImageUploadButtonProps extends Omit<ButtonProps, 'type'>, UseImageUploadConfig {
  text?: string;
}

export const ImageUploadButton = React.forwardRef<HTMLButtonElement, ImageUploadButtonProps>(
  (
    { editor: providedEditor, text, hideWhenUnavailable = false, onInserted, onClick, children, ...buttonProps },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const { isVisible, canInsert, handleImage, label, isActive, Icon } = useImageUpload({
      editor,
      hideWhenUnavailable,
      onInserted,
    });

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        handleImage();
      },
      [handleImage, onClick]
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
        disabled={!canInsert}
        data-disabled={!canInsert}
        aria-label={label}
        aria-pressed={isActive}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <Icon className='tiptap-button-icon' />
            {text && <span className='tiptap-button-text'>{text}</span>}
          </>
        )}
      </Button>
    );
  }
);

ImageUploadButton.displayName = 'ImageUploadButton';
