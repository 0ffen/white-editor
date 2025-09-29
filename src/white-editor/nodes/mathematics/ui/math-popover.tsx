import React from 'react';
import BlockMathIcon from '@/assets/icons/math-block.svg?react';
import InlineMathIcon from '@/assets/icons/math-inline.svg?react';
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

    const { isVisible, isActive, mathString, setMathString, setMath, removeMath } = useMathematics({
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
            data-active-state={isActive ? 'on' : 'off'}
            aria-label={'math'}
            aria-pressed={isActive}
            isActive={isActive}
            disabled={!isVisible}
            onClick={handleClick}
            {...buttonProps}
            ref={ref}
          >
            {type === 'block' ? icon || <BlockMathIcon /> : icon || <InlineMathIcon />}
          </Button>
        </PopoverTrigger>
        <PopoverContent align='start' className={cn('w-[300px] rounded-2xl px-2 py-2', mathPopoverClassName)}>
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
