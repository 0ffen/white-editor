import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/utils/utils';
import * as TogglePrimitive from '@radix-ui/react-toggle';

const toggleVariants = cva(
  'we:inline-flex we:items-center we:justify-center we:gap-2 we:rounded we:text-sm we:font-medium we:text-text-sub we:transition-colors we:hover:bg-interaction-hover we:focus-visible:outline-none we:focus-visible:border we:focus-visible:border-brand-default we:disabled:pointer-events-none we:disabled:text-text-light we:data-[state=on]:bg-brand-weak we:data-[state=on]:text-brand-default we:[&_svg]:pointer-events-none we:[&_svg]:size-[20px] we:[&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'we:bg-transparent',
        outline:
          'we:border we:border-border-default we:bg-transparent we:shadow-sm we:hover:bg-interaction-hover we:hover:text-text-normal',
      },
      size: {
        default: 'we:h-7 we:p-1 we:min-w-7',
        sm: 'we:h-6 we:px-1 we:min-w-6',
        lg: 'we:h-9 we:px-2 we:min-w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root ref={ref} className={cn(toggleVariants({ variant, size, className }))} {...props} />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
