import * as React from 'react';
import { cn } from '@/shared/utils';
import * as PopoverPrimitive from '@radix-ui/react-popover';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'we:bg-popover we:text-popover-foreground we:data-[state=open]:animate-in we:data-[state=closed]:animate-out we:data-[state=closed]:fade-out-0 we:data-[state=open]:fade-in-0 we:data-[state=closed]:zoom-out-95 we:data-[state=open]:zoom-in-95 we:data-[side=bottom]:slide-in-from-top-2 we:data-[side=left]:slide-in-from-right-2 we:data-[side=right]:slide-in-from-left-2 we:data-[side=top]:slide-in-from-bottom-2 we:z-50 we:w-72 we:origin-[--radix-popover-content-transform-origin] we:rounded-xl we:p-4 we:outline-none',
          className
        )}
        style={{
          boxShadow: 'var(--we-popover-shadow)',
        }}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
