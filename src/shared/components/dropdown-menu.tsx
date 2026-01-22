import * as React from 'react';
import { CheckIcon, ChevronRightIcon } from 'lucide-react';

import { cn } from '@/shared/utils';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';

function DropdownMenu({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot='dropdown-menu' {...props} />;
}

function DropdownMenuPortal({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return <DropdownMenuPrimitive.Portal data-slot='dropdown-menu-portal' {...props} />;
}

function DropdownMenuTrigger({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger data-slot='dropdown-menu-trigger' {...props} />;
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot='dropdown-menu-content'
        sideOffset={sideOffset}
        className={cn(
          'we:bg-elevation-dropdown we:text-text-normal we:text-sm we:data-[state=open]:animate-in we:data-[state=closed]:animate-out we:data-[state=closed]:fade-out-0 we:data-[state=open]:fade-in-0 we:data-[state=closed]:zoom-out-95 we:data-[state=open]:zoom-in-95 we:data-[side=bottom]:slide-in-from-top-2 we:data-[side=left]:slide-in-from-right-2 we:data-[side=right]:slide-in-from-left-2 we:data-[side=top]:slide-in-from-bottom-2 we:z-50 we:max-h-(--radix-dropdown-menu-content-available-height) we:min-w-fit we:origin-(--radix-dropdown-menu-content-transform-origin) we:overflow-x-hidden we:overflow-y-auto we:rounded-sm we:p-2',
          className
        )}
        style={{
          boxShadow: 'var(--we-popover-shadow)',
        }}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot='dropdown-menu-group' {...props} />;
}

function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: 'default' | 'destructive';
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot='dropdown-menu-item'
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "we:focus:bg-interaction-hover we:data-[variant=destructive]:text-destructive we:data-[variant=destructive]:focus:bg-destructive/10 dark:we:data-[variant=destructive]:focus:bg-destructive/20 we:data-[variant=destructive]:*:[svg]:!text-destructive we:[&_svg:not([class*='text-'])]:text-muted-foreground we:relative we:flex we:cursor-default we:items-start we:gap-2 we:rounded we:px-2 we:py-2 we:text-sm we:outline-none we:border-none we:select-none we:data-[disabled]:pointer-events-none we:data-[disabled]:opacity-50 we:data-[inset]:pl-8 we:[&_svg]:pointer-events-none we:[&_svg]:shrink-0 we:[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot='dropdown-menu-checkbox-item'
      className={cn(
        'we:focus:bg-interaction-hover we:relative we:flex we:cursor-default we:items-center we:gap-2 we:rounded we:py-2 we:pl-2 we:pr-8 we:text-sm we:outline-none we:border-none we:select-none we:min-w-[128px] we:data-[disabled]:pointer-events-none we:data-[disabled]:opacity-50',
        className
      )}
      checked={checked}
      {...props}
    >
      {children}
      <span className='we:pointer-events-none we:absolute we:right-2 we:flex we:items-center we:justify-center'>
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className='we:size-5 we:text-brand-default' />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return <DropdownMenuPrimitive.RadioGroup data-slot='dropdown-menu-radio-group' {...props} />;
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot='dropdown-menu-radio-item'
      className={cn(
        'we:focus:bg-interaction-hover we:relative we:flex we:cursor-default we:items-center we:gap-2 we:rounded we:py-2 we:pl-2 we:pr-8 we:text-sm we:outline-none we:border-none we:select-none we:min-w-[128px] we:data-[disabled]:pointer-events-none we:data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      {children}
      <span className='we:pointer-events-none we:absolute we:right-2 we:flex we:items-center we:justify-center'>
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className='we:size-5 we:text-brand-default' />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot='dropdown-menu-label'
      data-inset={inset}
      className={cn('we:px-2 we:py-1.5 we:text-sm we:font-medium we:data-[inset]:pl-8', className)}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot='dropdown-menu-separator'
      className={cn('we:bg-border we:-mx-1 we:my-1 we:h-px', className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='dropdown-menu-shortcut'
      className={cn('we:text-muted-foreground we:ml-auto we:text-xs we:tracking-widest', className)}
      {...props}
    />
  );
}

function DropdownMenuSub({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot='dropdown-menu-sub' {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot='dropdown-menu-sub-trigger'
      data-inset={inset}
      className={cn(
        'we:focus:bg-interaction-hover we:data-[state=open]:bg-interaction-hover we:flex we:cursor-default we:items-start we:rounded we:px-2 we:py-2 we:text-sm we:outline-none we:border-none we:select-none we:data-[inset]:pl-8',
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className='we:ml-auto we:size-4 we:text-text-normal' />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot='dropdown-menu-sub-content'
      className={cn(
        'we:bg-elevation-dropdown we:text-text-normal we:font-pretendard we:text-sm we:data-[state=open]:animate-in we:data-[state=closed]:animate-out we:data-[state=closed]:fade-out-0 we:data-[state=open]:fade-in-0 we:data-[state=closed]:zoom-out-95 we:data-[state=open]:zoom-in-95 we:data-[side=bottom]:slide-in-from-top-2 we:data-[side=left]:slide-in-from-right-2 we:data-[side=right]:slide-in-from-left-2 we:data-[side=top]:slide-in-from-bottom-2 we:z-50 we:min-w-[8rem] we:origin-(--radix-dropdown-menu-content-transform-origin) we:overflow-hidden we:rounded-md we:border we:p-1',
        className
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
