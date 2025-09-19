import * as React from 'react';

import { Popover, PopoverContent, PopoverTrigger, type ButtonProps } from '@/components';

import { useTiptapEditor } from '@/hooks';
import { cn } from '@/utils';
import { LinkButton } from './link-button';
import { LinkMain } from './link-main';
import { useLinkPopover, type UseLinkPopoverConfig } from './use-link-popover';

export interface LinkPopoverProps extends Omit<ButtonProps, 'type'>, UseLinkPopoverConfig {
  onOpenChange?: (isOpen: boolean) => void;
  autoOpenOnLinkActive?: boolean;
  placeholder?: string;
  linkPopoverClassName?: string;
}

/**
 * @name LinkPopover
 *
 * 커스텀 팝오버 구현이 필요한 경우 useLinkPopover 훅을 사용
 */
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

    const { isVisible, canSet, isActive, url, setUrl, setLink, removeLink, openLink, label, Icon } = useLinkPopover({
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
            aria-label={label}
            aria-pressed={isActive}
            onClick={handleClick}
            {...buttonProps}
            ref={ref}
          >
            {children ?? <Icon />}
          </LinkButton>
        </PopoverTrigger>

        <PopoverContent className={cn('border-none p-2 shadow-sm', linkPopoverClassName)}>
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
