import * as React from 'react';

import { Ban, ChevronDown } from 'lucide-react';

import { cn, useTranslate } from '@/shared';
import { Button, PopoverContent, PopoverTrigger, Separator, type ButtonProps } from '@/shared/components';
import { useTiptapEditor } from '@/shared/hooks';
import {
  getDisplayTextColor,
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
      size='icon'
      className={cn(className, 'we:w-auto we:min-w-0 we:gap-1 we:px-0.5')}
      data-style='ghost'
      data-appearance='default'
      role='button'
      tabIndex={-1}
      aria-label='Text Color'
      ref={ref}
      {...props}
    >
      <span
        className='we:size-4 we:shrink-0 we:rounded-full'
        style={{ backgroundColor: currentTextColor || 'var(--we-text-normal)' }}
      />
      <ChevronDown className='we:size-2.5 we:shrink-0 we:text-foreground/60' />
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
  const t = useTranslate();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { isVisible, canTextColor, isActive, label, handleRemoveTextColor } = useTextColor({
    editor,
    hideWhenUnavailable,
    onApplied,
  });

  const rawTextColor = editor?.getAttributes('textStyle')?.color || '';
  // 색이 없거나 팔레트에 없으면 기본 색을 팔레트에 표시
  const currentTextColor = getDisplayTextColor(rawTextColor) || 'var(--we-text-normal)';

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
          tooltip={t('color')}
          isActive={isActive}
          currentTextColor={currentTextColor}
          {...props}
        />
      </PopoverTrigger>

      <PopoverContent aria-label='Color picker' className='we:h-auto we:w-fit we:p-1.5' side='bottom' align='start'>
        <div
          ref={containerRef}
          tabIndex={0}
          className='we:flex we:items-center we:gap-0.5 we:outline-none focus:we:outline-none'
        >
          {textColors?.map((color) => (
            <TextColorButton key={color.value} editor={editor} textColor={color} aria-label={`${color.label} color`} />
          ))}
          <Separator orientation='vertical' className='we:mx-0.5 we:h-4!' />
          <Button
            type='button'
            size='icon'
            className='we:h-7 we:w-7'
            onClick={handleRemoveTextColor}
            aria-label='Remove text color'
            tooltip={t('removeColor')}
          >
            <Ban className='we:text-text-sub' />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
