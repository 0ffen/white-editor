import * as React from 'react';

import { Ban, TypeIcon } from 'lucide-react';

import {
  pickTextColorsByValue,
  TEXT_COLORS_MAP,
  TextColorButton,
  useTextColor,
  type ColorValue,
  type UseTextColorConfig,
} from '@/editor';
import { Button, PopoverContent, PopoverTrigger, Separator, type ButtonProps } from '@/shared/components';
import { useTiptapEditor } from '@/shared/hooks';
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

const ColorPickerButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, children, ...props }, ref) => (
  <Button
    type='button'
    className={className}
    data-style='ghost'
    data-appearance='default'
    role='button'
    tabIndex={-1}
    aria-label='Text Color'
    ref={ref}
    {...props}
  >
    {children ?? <TypeIcon />}
  </Button>
));

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
          tooltip={label}
          isActive={isActive}
          {...props}
        >
          <TypeIcon style={{ color: currentTextColor }} />
        </ColorPickerButton>
      </PopoverTrigger>

      <PopoverContent aria-label='Color picker' className='h-10 w-fit p-2' side='bottom' align='start'>
        <div ref={containerRef} tabIndex={0} className='flex h-full flex-1 items-center gap-1'>
          {textColors?.map((color) => (
            <TextColorButton key={color.value} editor={editor} textColor={color} aria-label={`${color.label} color`} />
          ))}
          <Separator orientation='vertical' className='mx-1' />
          <Button
            type='button'
            size='icon'
            className='h-6 w-6'
            onClick={handleRemoveTextColor}
            aria-label='Remove text color'
          >
            <Ban className='text-foreground/80' size={4} />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
