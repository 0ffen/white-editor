import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { Separator } from '@/shared/components';
import { useComposedRef, useMenuNavigation } from '@/shared/hooks';
import { cn } from '@/shared/utils';

const toolbarVariants = cva('we:flex we:items-center we:gap-1', {
  variants: {
    variant: {
      fixed: [
        'we:z-10 we:w-full we:min-h-[2.75rem]',
        'we:bg-transparent we:border-b we:border-border we:rounded-t-md',
        'we:px-2 we:overflow-x-auto we:overscroll-x-contain',
      ],
      floating: [
        'we:p-0.5 we:rounded-lg we:border we:border-border',
        'we:bg-background we:shadow-xs we:outline-none we:overflow-hidden',
      ],
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
          variant === 'floating' && plain && 'we:rounded-none we:border-none we:bg-transparent we:p-0 we:shadow-none',
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
    <div
      ref={ref}
      role='group'
      className={cn('we:flex we:items-center we:gap-0.5 we:max-sm:flex-shrink-0', className)}
      {...props}
    >
      {children}
    </div>
  );
});
ToolbarGroup.displayName = 'ToolbarGroup';

export const ToolbarSeparator = React.forwardRef<HTMLDivElement, BaseProps>(({ ...props }, ref) => (
  <Separator ref={ref} orientation='vertical' decorative className='we:h-5!' {...props} />
));
ToolbarSeparator.displayName = 'ToolbarSeparator';
