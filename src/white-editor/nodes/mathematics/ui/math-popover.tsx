import React from 'react';
import BlockMathIcon from '@/assets/icons/math-block.svg?react';
import InlineMathIcon from '@/assets/icons/math-inline.svg?react';
import { getTranslate } from '@/shared';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@/shared/components';
import { useTiptapEditor } from '@/shared/hooks';
import { cn } from '@/shared/utils';
import { MathPopoverContent, type MathPopoverProps, useMathematics } from '@/white-editor';

export const MathPopover = React.forwardRef<HTMLButtonElement, MathPopoverProps>(
  (
    {
      type,
      editor: providedEditor,
      hideWhenUnavailable = false,
      onSetMath,
      onOpenChange,
      onClick,
      placeholder,
      mathPopoverClassName,
      icon,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const [isOpen, setIsOpen] = React.useState<boolean>(false);

    const { isVisible, isActive, mathString, canSet, setMathString, setMath, removeMath } = useMathematics({
      editor,
      hideWhenUnavailable,
      onSetMath,
      type,
    });

    const handleOnOpenChange = React.useCallback(
      (nextIsOpen: boolean) => {
        setIsOpen(nextIsOpen);
        onOpenChange?.(nextIsOpen);
        if (!nextIsOpen && editor) {
          const { to } = editor.state.selection;
          editor.commands.focus();
          editor.commands.setTextSelection(to);
        }
      },
      [onOpenChange, editor]
    );

    const handleSetMath = React.useCallback(() => {
      setMath();
      setIsOpen(false);
    }, [setMath]);

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        setIsOpen(!isOpen);
      },
      [onClick, isOpen]
    );

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          setMath();
          setIsOpen(false);
        }
      },
      [setMath]
    );

    React.useEffect(() => {
      if (isActive) {
        setIsOpen(true);
      }
    }, [isActive]);

    if (!isVisible) {
      return null;
    }

    return (
      <Popover open={isOpen} onOpenChange={handleOnOpenChange} modal>
        <PopoverTrigger asChild>
          <Button
            type='button'
            size='icon'
            data-active-state={isActive ? 'on' : 'off'}
            aria-label={type === 'block' ? 'Block Math' : 'Inline Math'}
            aria-pressed={isActive}
            tooltip={type === 'block' ? getTranslate('blockMath') : getTranslate('inlineMath')}
            isActive={isActive}
            disabled={!canSet}
            onClick={handleClick}
            {...buttonProps}
            ref={ref}
          >
            {type === 'block' ? icon || <BlockMathIcon /> : icon || <InlineMathIcon />}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align='start'
          className={cn('we:w-[300px] we:rounded-[5px] we:px-2 we:py-2', mathPopoverClassName)}
        >
          <MathPopoverContent
            mathString={mathString}
            setMathString={setMathString}
            isActive={isActive}
            removeMath={removeMath}
            setMath={handleSetMath}
            handleKeyDown={handleKeyDown}
            placeholder={placeholder}
          />
        </PopoverContent>
      </Popover>
    );
  }
);

MathPopover.displayName = 'MathPopover';
