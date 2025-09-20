import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { Separator } from '@/components';
import { useComposedRef, useMenuNavigation } from '@/hooks';

import { cn } from '@/utils/utils';

const toolbarVariants = cva('flex items-center gap-1', {
  variants: {
    variant: {
      fixed: [
        'sticky top-0 z-10 w-full min-h-[2.75rem]',
        'bg-transparent border-b border-border',
        'px-2 overflow-x-auto overscroll-x-contain',
      ],
      floating: ['p-0.5 rounded-lg border border-border', 'bg-background shadow-xs outline-none overflow-hidden'],
    },
  },
  defaultVariants: {
    variant: 'fixed',
  },
});

type BaseProps = React.HTMLAttributes<HTMLDivElement>;

interface ToolbarProps extends BaseProps, VariantProps<typeof toolbarVariants> {
  plain?: boolean; // floating variant에서만 사용
}

const useToolbarNavigation = (toolbarRef: React.RefObject<HTMLDivElement | null>) => {
  const [items, setItems] = React.useState<HTMLElement[]>([]);

  const collectItems = React.useCallback(() => {
    if (!toolbarRef.current) return [];
    return Array.from(
      toolbarRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [role="button"]:not([disabled]), [tabindex="0"]:not([disabled])'
      )
    );
  }, [toolbarRef]);

  React.useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    const updateItems = () => setItems(collectItems());

    updateItems();
    const observer = new MutationObserver(updateItems);
    observer.observe(toolbar, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [collectItems, toolbarRef]);

  const { selectedIndex } = useMenuNavigation<HTMLElement>({
    containerRef: toolbarRef,
    items,
    orientation: 'horizontal',
    onSelect: (el) => el.click(),
    autoSelectFirstItem: false,
  });

  React.useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (toolbar.contains(target)) target.setAttribute('data-focus-visible', 'true');
    };

    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (toolbar.contains(target)) target.removeAttribute('data-focus-visible');
    };

    toolbar.addEventListener('focus', handleFocus, true);
    toolbar.addEventListener('blur', handleBlur, true);

    return () => {
      toolbar.removeEventListener('focus', handleFocus, true);
      toolbar.removeEventListener('blur', handleBlur, true);
    };
  }, [toolbarRef]);

  React.useEffect(() => {
    if (selectedIndex !== undefined && items[selectedIndex]) {
      items[selectedIndex].focus();
    }
  }, [selectedIndex, items]);
};

export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  ({ children, className, variant, plain = false, ...props }, ref) => {
    const toolbarRef = React.useRef<HTMLDivElement>(null);
    const composedRef = useComposedRef(toolbarRef, ref);
    useToolbarNavigation(toolbarRef);

    return (
      <div
        ref={composedRef}
        role='toolbar'
        aria-label='toolbar'
        data-variant={variant}
        data-plain={plain}
        className={cn(
          toolbarVariants({ variant }),
          variant === 'floating' && plain && 'rounded-none border-none bg-transparent p-0 shadow-none',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Toolbar.displayName = 'Toolbar';

export const ToolbarGroup = React.forwardRef<HTMLDivElement, BaseProps>(({ children, className, ...props }, ref) => {
  const childrenArray = React.Children.toArray(children);
  const hasValidChildren =
    childrenArray.length > 0 &&
    childrenArray.some(
      (child) =>
        React.isValidElement(child) || (typeof child === 'string' && child.trim() !== '') || typeof child === 'number'
    );

  if (!hasValidChildren) {
    return null;
  }

  return (
    <div ref={ref} role='group' className={cn('flex items-center gap-0.5 max-sm:flex-shrink-0', className)} {...props}>
      {children}
    </div>
  );
});
ToolbarGroup.displayName = 'ToolbarGroup';

export const ToolbarSeparator = React.forwardRef<HTMLDivElement, BaseProps>(({ ...props }, ref) => (
  <Separator ref={ref} orientation='vertical' decorative {...props} />
));
ToolbarSeparator.displayName = 'ToolbarSeparator';
