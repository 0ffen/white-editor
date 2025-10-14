import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/utils/utils';
import * as TogglePrimitive from '@radix-ui/react-toggle';

const toggleVariants = cva(
  'we:inline-flex we:items-center we:justify-center we:gap-2 we:rounded-md we:text-sm we:font-medium we:transition-colors we:hover:bg-muted we:focus-visible:outline-none we:focus-visible:ring-1 we:focus-visible:ring-ring we:disabled:pointer-events-none we:disabled:opacity-50 we:data-[state=on]:bg-accent we:data-[state=on]:text-accent-foreground we:[&_svg]:pointer-events-none we:[&_svg]:size-4 we:[&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'we:bg-transparent',
        outline:
          'we:border we:border-input we:bg-transparent we:shadow-sm we:hover:bg-accent we:hover:text-accent-foreground',
      },
      size: {
        default: 'we:h-9 we:px-2 we:min-w-9',
        sm: 'we:h-8 we:px-1.5 we:min-w-8',
        lg: 'we:h-10 we:px-2.5 we:min-w-10',
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
