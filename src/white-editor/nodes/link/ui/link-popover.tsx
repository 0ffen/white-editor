import * as React from 'react';

import { LinkIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger, type ButtonProps } from '@/shared/components';
import { useTiptapEditor } from '@/shared/hooks';
import { cn } from '@/shared/utils';
import { useLinkPopover, type UseLinkPopoverConfig, LinkMain, LinkButton } from '@/white-editor';

export interface LinkPopoverProps extends Omit<ButtonProps, 'type'>, UseLinkPopoverConfig {
  onOpenChange?: (isOpen: boolean) => void;
  autoOpenOnLinkActive?: boolean;
  placeholder?: string;
  linkPopoverClassName?: string;
  icon?: React.ReactNode;
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
      icon,
      placeholder,
      linkPopoverClassName,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const [isOpen, setIsOpen] = React.useState<boolean>(false);

    const { isVisible, canSet, isActive, url, setUrl, setLink, removeLink } = useLinkPopover({
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
            {icon || <LinkIcon />}
          </LinkButton>
        </PopoverTrigger>

        <PopoverContent className={cn('w-[300px] rounded-2xl px-2 py-2 pr-3', linkPopoverClassName)}>
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
