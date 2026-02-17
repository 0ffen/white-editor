import * as React from 'react';
import { Ban, LucideHighlighter } from 'lucide-react';
import { useTranslate } from '@/shared';
import { Button, PopoverContent, PopoverTrigger, Separator, type ButtonProps } from '@/shared/components';
import { useTiptapEditor } from '@/shared/hooks';
import { cn } from '@/shared/utils';
import {
  HIGHLIGHT_COLORS,
  HIGHLIGHT_COLORS_MAP,
  pickHighlightColorsByValue,
  useColorHighlight,
  type HighlightColor,
  type UseColorHighlightConfig,
  HighlightColorButton,
} from '@/white-editor';
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
  icon?: React.ReactNode;
}

interface HighlightPickerButtonProps extends ButtonProps {
  activeIconColor?: string;
}

const HighlightPickerButton = React.forwardRef<HTMLButtonElement, HighlightPickerButtonProps>(
  ({ className, children, activeClassName, activeIconColor, ...props }, ref) => {
    const hasActiveColor = activeClassName && activeIconColor;

    // Clone children to apply color if it's a React element
    const iconWithColor = React.useMemo(() => {
      if (!children) {
        return (
          <LucideHighlighter
            style={hasActiveColor ? { color: activeIconColor } : undefined}
            className={hasActiveColor ? undefined : 'we:text-foreground'}
          />
        );
      }

      if (hasActiveColor && React.isValidElement(children)) {
        const childElement = children as React.ReactElement<{ style?: React.CSSProperties }>;
        return React.cloneElement(childElement, {
          ...childElement.props,
          style: { ...childElement.props?.style, color: activeIconColor },
        });
      }

      return children;
    }, [children, hasActiveColor, activeIconColor]);

    return (
      <Button
        type='button'
        size='icon'
        className={cn(!hasActiveColor && 'we:data-[active=true]:[&_svg]:text-foreground', className)}
        data-style='ghost'
        data-appearance='default'
        role='button'
        tabIndex={-1}
        aria-label='Highlight'
        style={{
          backgroundColor: activeClassName,
        }}
        ref={ref}
        {...props}
      >
        {iconWithColor}
      </Button>
    );
  }
);

HighlightPickerButton.displayName = 'HighlightPickerButton';

export function HighlightPopover({
  editor: providedEditor,
  highlightColors = pickHighlightColorsByValue(HIGHLIGHT_COLORS_MAP),
  hideWhenUnavailable = false,
  onApplied,
  icon,
  ...props
}: HighlightPopoverProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const t = useTranslate();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { isVisible, canColorHighlight, isActive, label, handleRemoveHighlight } = useColorHighlight({
    editor,
    hideWhenUnavailable,
    onApplied,
  });

  const currentHighlightColor = editor?.getAttributes('highlight')?.color || '';

  // 아이콘에 표시할 강조 색 (고정 팔레트의 border 값)
  const currentIconColor = React.useMemo(() => {
    if (!currentHighlightColor) return undefined;
    const entry = HIGHLIGHT_COLORS.find((c) => c.value === currentHighlightColor);
    return entry?.border;
  }, [currentHighlightColor]);

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
          tooltip={t('highlight')}
          isActive={isActive}
          activeClassName={currentHighlightColor}
          activeIconColor={currentIconColor}
          {...props}
        >
          {icon || <LucideHighlighter />}
        </HighlightPickerButton>
      </PopoverTrigger>

      <PopoverContent aria-label='Highlight picker' className='we:h-10 we:w-fit we:p-2' side='bottom' align='start'>
        <div
          ref={containerRef}
          tabIndex={0}
          className='we:flex we:h-full we:flex-1 we:items-center we:gap-1 we:outline-none focus:we:outline-none'
        >
          {highlightColors?.map((color) => (
            <HighlightColorButton
              key={color.value}
              editor={editor}
              highlightColor={color}
              aria-label={`${color.label} highlight color`}
            />
          ))}
          <Separator orientation='vertical' className='mx-1' />
          <Button
            type='button'
            size='icon'
            className='we:h-6 we:w-6'
            onClick={handleRemoveHighlight}
            aria-label='Remove highlight'
            tooltip={t('removeHighlight')}
          >
            <Ban className='we:text-text-sub' size={20} />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
