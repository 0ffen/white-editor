import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';

import { toggleVariants } from '@/shared/components';
import { cn } from '@/shared/utils';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
  size: 'default',
  variant: 'default',
});

function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot='toggle-group'
      data-variant={variant}
      data-size={size}
      className={cn(
        'group/toggle-group we:flex we:w-fit we:items-center we:rounded-md we:data-[variant=outline]:shadow-xs',
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      data-slot='toggle-group-item'
      data-variant={context.variant || variant}
      data-size={context.size || size}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        'we:min-w-0 we:flex-1 we:shrink-0 we:rounded-none we:shadow-none we:first:rounded-l-md we:last:rounded-r-md we:focus:z-10 we:focus-visible:z-10 we:data-[variant=outline]:border-l-0 we:data-[variant=outline]:first:border-l',
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };
