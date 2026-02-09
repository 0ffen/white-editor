import * as React from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

import { cn } from '@/shared/utils';
import * as SelectPrimitive from '@radix-ui/react-select';

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'we:border-input we:ring-offset-background we:data-[placeholder]:text-muted-foreground we:focus:ring-ring we:flex we:h-9 we:w-full we:items-center we:justify-between we:rounded-md we:border we:bg-transparent we:px-3 we:py-2 we:text-sm we:whitespace-nowrap we:shadow-sm we:focus:ring-1 we:focus:outline-none we:disabled:cursor-not-allowed we:disabled:opacity-50 we:[&>span]:line-clamp-1',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className='we:h-4 we:w-4 we:opacity-50' />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn('we:flex we:cursor-default we:items-center we:justify-center we:py-1', className)}
    {...props}
  >
    <ChevronUp className='h-4 w-4' />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn('we:flex we:cursor-default we:items-center we:justify-center we:py-1', className)}
    {...props}
  >
    <ChevronDown className='we:h-4 we:w-4' />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'we:bg-elevation-dropdown we:text-text-normal we:data-[state=open]:animate-in we:data-[state=closed]:animate-out we:data-[state=closed]:fade-out-0 we:data-[state=open]:fade-in-0 we:data-[state=closed]:zoom-out-95 we:data-[state=open]:zoom-in-95 we:data-[side=bottom]:slide-in-from-top-2 we:data-[side=left]:slide-in-from-right-2 we:data-[side=right]:slide-in-from-left-2 we:data-[side=top]:slide-in-from-bottom-2 we:relative we:z-floating we:max-h-[--radix-select-content-available-height] we:min-w-[8rem] we:origin-[--radix-select-content-transform-origin] we:overflow-x-hidden we:overflow-y-auto we:rounded-md we:border we:shadow-md',
        position === 'popper' &&
          'we:data-[side=bottom]:translate-y-1 we:data-[side=left]:-translate-x-1 we:data-[side=right]:translate-x-1 we:data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'we:h-[var(--radix-select-trigger-height)] we:w-full we:min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('we:px-2 we:py-1.5 we:text-sm we:font-semibold', className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'we:focus:bg-interaction-hover we:focus:text-text-normal we:relative we:flex we:w-full we:cursor-default we:items-center we:rounded-sm we:py-1.5 we:pr-8 we:pl-2 we:text-sm we:outline-none we:select-none we:data-[disabled]:pointer-events-none we:data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className='we:absolute we:right-2 we:flex we:h-3.5 we:w-3.5 we:items-center we:justify-center'>
      <SelectPrimitive.ItemIndicator>
        <Check className='we:h-4 we:w-4' />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn('we:bg-muted we:-mx-1 we:my-1 we:h-px', className)} {...props} />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
