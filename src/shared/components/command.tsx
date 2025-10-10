import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react';

import { Dialog, DialogContent } from '@/shared/components';
import { cn } from '@/shared/utils';
import { type DialogProps } from '@radix-ui/react-dialog';

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'we:bg-popover we:text-popover-foreground we:flex we:h-full we:w-full we:flex-col we:overflow-hidden we:rounded-md',
      className
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

const CommandDialog = ({ children, ...props }: DialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className='we:overflow-hidden we:p-0'>
        <Command className='we:[&_[cmdk-group-heading]]:text-muted-foreground we:[&_[cmdk-group-heading]]:px-2 we:[&_[cmdk-group-heading]]:font-medium we:[&_[cmdk-group]]:px-2 we:[&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 we:[&_[cmdk-input-wrapper]_svg]:h-5 we:[&_[cmdk-input-wrapper]_svg]:w-5 we:[&_[cmdk-input]]:h-12 we:[&_[cmdk-item]]:px-2 we:[&_[cmdk-item]]:py-3 we:[&_[cmdk-item]_svg]:h-5 we:[&_[cmdk-item]_svg]:w-5'>
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className='we:flex we:items-center we:border-b we:px-3'>
    <Search className='we:mr-2 we:h-4 we:w-4 we:shrink-0 we:opacity-50' />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'we:placeholder:text-foreground/30 we:flex we:h-10 we:w-full we:rounded-md we:bg-transparent we:py-3 we:text-sm we:outline-none we:disabled:cursor-not-allowed we:disabled:opacity-50',
        className
      )}
      {...props}
    />
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn('we:max-h-[300px] we:overflow-x-hidden we:overflow-y-auto', className)}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => <CommandPrimitive.Empty ref={ref} className='we:py-6 we:text-center we:text-sm' {...props} />);

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'we:text-foreground [&_[cmdk-group-heading]]:we:text-foreground we:overflow-hidden we:p-1 [&_[cmdk-group-heading]]:we:px-2 [&_[cmdk-group-heading]]:we:py-1.5 [&_[cmdk-group-heading]]:we:text-xs [&_[cmdk-group-heading]]:we:font-medium',
      className
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator ref={ref} className={cn('we:bg-border we:-mx-1 we:h-px', className)} {...props} />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      'we:data-[selected=true]:bg-accent we:data-[selected=true]:text-foreground we:relative we:flex we:cursor-default we:items-center we:gap-2 we:rounded-sm we:px-2 we:py-1.5 we:text-sm we:outline-none we:select-none we:data-[disabled=true]:pointer-events-none we:data-[disabled=true]:opacity-50 we:[&_svg]:pointer-events-none we:[&_svg]:size-4 we:[&_svg]:shrink-0',
      className
    )}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span className={cn('we:text-muted-foreground we:ml-auto we:text-xs we:tracking-widest', className)} {...props} />
  );
};
CommandShortcut.displayName = 'CommandShortcut';

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
