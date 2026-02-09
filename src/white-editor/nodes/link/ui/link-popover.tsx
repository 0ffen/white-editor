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

    // 링크 드롭다운이 열려있으면 기본 Popover를 닫음
    React.useEffect(() => {
      const handleLinkDropdownOpen = () => {
        if (isOpen) {
          setIsOpen(false);
        }
      };

      window.addEventListener('link-dropdown-open', handleLinkDropdownOpen);

      return () => {
        window.removeEventListener('link-dropdown-open', handleLinkDropdownOpen);
      };
    }, [isOpen]);

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

        // 링크가 활성화되어 있으면 LinkFloatingDropdown을 트리거하고 기본 Popover는 닫음
        if (isActive) {
          setIsOpen(false);
          // 커스텀 이벤트 발생
          window.dispatchEvent(new CustomEvent('link-toolbar-button-click'));
          return;
        }

        // 링크가 없으면 일반 Popover 표시
        setIsOpen(!isOpen);
      },
      [onClick, isOpen, isActive]
    );

    // 링크가 활성화되어 있을 때는 LinkFloatingDropdown을 사용하므로
    // 기본 Popover는 자동으로 열리지 않도록 함
    React.useEffect(() => {
      // autoOpenOnLinkActive가 true이고 링크가 활성화되어 있으면
      // LinkFloatingDropdown이 처리하므로 여기서는 열지 않음
      if (autoOpenOnLinkActive && isActive) {
        setIsOpen(false);
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

        <PopoverContent className={cn('we:w-[240px] we:rounded-lg we:p-1.5 we:shadow-lg', linkPopoverClassName)}>
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
