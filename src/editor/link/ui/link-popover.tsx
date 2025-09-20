import * as React from 'react';

import { Popover, PopoverContent, PopoverTrigger, type ButtonProps } from '@/components';
import { useLinkPopover, type UseLinkPopoverConfig, LinkMain, LinkButton } from '@/editor';
import { useTiptapEditor } from '@/hooks';
import { cn } from '@/utils';

export interface LinkPopoverProps extends Omit<ButtonProps, 'type'>, UseLinkPopoverConfig {
  onOpenChange?: (isOpen: boolean) => void;
  autoOpenOnLinkActive?: boolean;
  placeholder?: string;
  linkPopoverClassName?: string;
}

export const LinkPopover = React.forwardRef<HTMLButtonElement, LinkPopoverProps>(
  (
    {
      editor: providedEditor,
      hideWhenUnavailable = false,
      onSetLink,
      onOpenChange,
      autoOpenOnLinkActive = true,
      onClick,
      children,
      placeholder,
      linkPopoverClassName,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const [isOpen, setIsOpen] = React.useState(false);

    const { isVisible, canSet, isActive, url, setUrl, setLink, removeLink, Icon } = useLinkPopover({
      editor,
      hideWhenUnavailable,
      onSetLink,
    });

    const handleOnOpenChange = React.useCallback(
      (nextIsOpen: boolean) => {
        setIsOpen(nextIsOpen);
        onOpenChange?.(nextIsOpen);
      },
      [onOpenChange]
    );

    const handleSetLink = React.useCallback(() => {
      setLink();
      setIsOpen(false);
    }, [setLink]);

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        setIsOpen(!isOpen);
      },
      [onClick, isOpen]
    );

    React.useEffect(() => {
      if (autoOpenOnLinkActive && isActive) {
        setIsOpen(true);
      }
    }, [autoOpenOnLinkActive, isActive]);

    if (!isVisible) {
      return null;
    }

    return (
      <Popover open={isOpen} onOpenChange={handleOnOpenChange}>
        <PopoverTrigger asChild>
          <LinkButton
            disabled={!canSet}
            data-active-state={isActive ? 'on' : 'off'}
            data-disabled={!canSet}
            aria-label={'link'}
            aria-pressed={isActive}
            isActive={isActive}
            onClick={handleClick}
            {...buttonProps}
            ref={ref}
          >
            {children ?? <Icon />}
          </LinkButton>
        </PopoverTrigger>

        <PopoverContent className={cn('rounded-4xl px-2 py-1 pr-3', linkPopoverClassName)}>
          <LinkMain
            url={url}
            setUrl={setUrl}
            setLink={handleSetLink}
            removeLink={removeLink}
            isActive={isActive}
            placeholder={placeholder}
          />
        </PopoverContent>
      </Popover>
    );
  }
);

LinkPopover.displayName = 'LinkPopover';
