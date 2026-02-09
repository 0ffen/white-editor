import * as React from 'react';

import { ImagePlusIcon } from 'lucide-react';
import { getTranslate } from '@/shared';
import { Button, type ButtonProps } from '@/shared/components';
import { useTiptapEditor } from '@/shared/hooks';
import { useImageUpload, type UseImageUploadConfig } from '@/white-editor';

export interface ImageUploadButtonProps extends Omit<ButtonProps, 'type'>, UseImageUploadConfig {
  icon?: React.ReactNode;
}

export const ImageUploadButton = React.forwardRef<HTMLButtonElement, ImageUploadButtonProps>(
  ({ editor: providedEditor, icon, hideWhenUnavailable = false, onInserted, onClick, ...buttonProps }, ref) => {
    const { editor } = useTiptapEditor(providedEditor);
    const { isVisible, canInsert, handleImage, label, isActive } = useImageUpload({
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
        size='icon'
        data-style='ghost'
        data-active-state={isActive ? 'on' : 'off'}
        role='button'
        tabIndex={-1}
        disabled={!canInsert}
        data-disabled={!canInsert}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={getTranslate('image')}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        <>{icon || <ImagePlusIcon />}</>
      </Button>
    );
  }
);

ImageUploadButton.displayName = 'ImageUploadButton';
