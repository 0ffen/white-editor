import * as React from 'react';
import { Ban, LucideHighlighter } from 'lucide-react';
import {
  HIGHLIGHT_COLORS_MAP,
  pickHighlightColorsByValue,
  useColorHighlight,
  type HighlightColor,
  type UseColorHighlightConfig,
  HighlightColorButton,
} from '@/editor';
import { Button, PopoverContent, PopoverTrigger, Separator, type ButtonProps } from '@/shared/components';
import { useTiptapEditor } from '@/shared/hooks';
import { cn } from '@/shared/utils';
import { Popover } from '@radix-ui/react-popover';
import { type Editor } from '@tiptap/react';

export interface HighlightPopoverContentProps {
  editor?: Editor | null;
  colors?: HighlightColor[];
}

export interface HighlightPopoverProps
  extends Omit<ButtonProps, 'type'>,
    Pick<UseColorHighlightConfig, 'editor' | 'hideWhenUnavailable' | 'onApplied'> {
  highlightColors?: HighlightColor[];
}

const HighlightPickerButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, activeClassName, ...props }, ref) => (
    <Button
      type='button'
      className={cn('data-[active=true]:[&_svg]:text-foreground', className)}
      data-style='ghost'
      data-appearance='default'
      role='button'
      tabIndex={-1}
      aria-label='Highlight'
      style={{ backgroundColor: activeClassName }}
      ref={ref}
      {...props}
    >
      {children ?? <LucideHighlighter />}
    </Button>
  )
);

HighlightPickerButton.displayName = 'HighlightPickerButton';

export function HighlightPopover({
  editor: providedEditor,
  highlightColors = pickHighlightColorsByValue(HIGHLIGHT_COLORS_MAP),
  hideWhenUnavailable = false,
  onApplied,
  ...props
}: HighlightPopoverProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { isVisible, canColorHighlight, isActive, label, handleRemoveHighlight } = useColorHighlight({
    editor,
    hideWhenUnavailable,
    onApplied,
  });

  const currentHighlightColor = editor?.getAttributes('highlight')?.color || '';

  if (!isVisible) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <HighlightPickerButton
          disabled={!canColorHighlight}
          data-active-state={isActive ? 'on' : 'off'}
          data-disabled={!canColorHighlight}
          aria-pressed={isActive}
          aria-label={label}
          tooltip={label}
          isActive={isActive}
          activeClassName={currentHighlightColor}
          {...props}
        >
          <LucideHighlighter />
        </HighlightPickerButton>
      </PopoverTrigger>

      <PopoverContent aria-label='Highlight picker' className='h-10 w-fit p-2' side='bottom' align='start'>
        <div ref={containerRef} tabIndex={0} className='flex h-full flex-1 items-center gap-1'>
          {highlightColors?.map((color) => (
            <HighlightColorButton
              key={color.value}
              editor={editor}
              highlightColor={color}
              tooltip={color.label}
              aria-label={`${color.label} highlight color`}
            />
          ))}
          <Separator orientation='vertical' className='mx-1' />
          <Button
            type='button'
            size='icon'
            className='h-6 w-6'
            onClick={handleRemoveHighlight}
            aria-label='Remove highlight'
          >
            <Ban className='text-foreground/80' size={4} />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
