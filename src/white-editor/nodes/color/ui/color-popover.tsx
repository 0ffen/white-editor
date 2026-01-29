import * as React from 'react';

import { Ban, ChevronDown } from 'lucide-react';

import { cn, getTranslate } from '@/shared';
import { Button, PopoverContent, PopoverTrigger, Separator, type ButtonProps } from '@/shared/components';
import { useTiptapEditor } from '@/shared/hooks';
import {
  pickTextColorsByValue,
  TEXT_COLORS_MAP,
  TextColorButton,
  useTextColor,
  type ColorValue,
  type UseTextColorConfig,
} from '@/white-editor';
import { Popover } from '@radix-ui/react-popover';
import { type Editor } from '@tiptap/react';

export interface ColorPopoverContentProps {
  editor?: Editor | null;
  colors?: ColorValue[];
}

export interface ColorPopoverProps
  extends Omit<ButtonProps, 'type'>,
    Pick<UseTextColorConfig, 'editor' | 'hideWhenUnavailable' | 'onApplied'> {
  textColors?: ColorValue[];
}

const ColorPickerButton = React.forwardRef<HTMLButtonElement, ButtonProps & { currentTextColor?: string }>(
  ({ className, currentTextColor, ...props }, ref) => (
    <Button
      type='button'
      className={cn(className, 'we:flex we:items-center we:px-1 we:h-[28px]')}
      data-style='ghost'
      data-appearance='default'
      role='button'
      tabIndex={-1}
      aria-label='Text Color'
      ref={ref}
      {...props}
    >
      <span
        className='we:h-5 we:w-5 we:rounded-full we:shrink-0'
        style={{ backgroundColor: currentTextColor || 'var(--we-text-normal)' }}
      />
      <ChevronDown className='we:h-3 we:w-3 we:text-foreground/60 we:shrink-0' />
    </Button>
  )
);

ColorPickerButton.displayName = 'ColorPickerButton';

export function ColorPopover({
  editor: providedEditor,
  textColors = pickTextColorsByValue(TEXT_COLORS_MAP),
  hideWhenUnavailable = false,
  onApplied,
  ...props
}: ColorPopoverProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { isVisible, canTextColor, isActive, label, handleRemoveTextColor } = useTextColor({
    editor,
    hideWhenUnavailable,
    onApplied,
  });

  const currentTextColor = editor?.getAttributes('textStyle')?.color || '';

  if (!isVisible) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <ColorPickerButton
          disabled={!canTextColor}
          data-active-state={isActive ? 'on' : 'off'}
          data-disabled={!canTextColor}
          aria-pressed={isActive}
          aria-label={label}
          tooltip={getTranslate('color')}
          isActive={isActive}
          currentTextColor={currentTextColor}
          {...props}
        />
      </PopoverTrigger>

      <PopoverContent aria-label='Color picker' className='we:h-auto we:w-fit we:p-2' side='bottom' align='start'>
        <div
          ref={containerRef}
          tabIndex={0}
          className='we:flex we:items-center we:gap-1.5 we:outline-none focus:we:outline-none'
        >
          {textColors?.map((color) => (
            <TextColorButton key={color.value} editor={editor} textColor={color} aria-label={`${color.label} color`} />
          ))}
          <Separator orientation='vertical' className='we:mx-1 we:h-6' />
          <Button
            type='button'
            size='icon'
            onClick={handleRemoveTextColor}
            aria-label='Remove text color'
            tooltip={getTranslate('removeColor')}
          >
            <Ban className='we:text-foreground/60' size={20} />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
