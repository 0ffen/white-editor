import * as React from 'react';
import { cn } from '@/shared/utils';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'we:text-primary-foreground dark:we:bg-card we:dark:text-card-foreground we:animate-in we:fade-in-0 we:zoom-in-95 we:data-[state=closed]:animate-out we:data-[state=closed]:fade-out-0 we:data-[state=closed]:zoom-out-95 we:data-[side=bottom]:slide-in-from-top-2 we:data-[side=left]:slide-in-from-right-2 we:data-[side=right]:slide-in-from-left-2 we:data-[side=top]:slide-in-from-bottom-2 we:rounded-md we:px-3 we:py-1.5 we:text-xs we:z-50 we:origin-[--radix-tooltip-content-transform-origin] we:overflow-hidden we:bg-stone-950',
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
