import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/utils/utils';
import { Slot } from '@radix-ui/react-slot';

const buttonVariants = cva(
  cn(
    'we:inline-flex we:items-center we:cursor-pointer we:data-[active=true]:bg-primary/10 dark:we:data-[active=true]:bg-secondary',
    'we:data-[active=true]:[&_svg]:text-primary we:w-full we:justify-center we:gap-2 we:whitespace-nowrap we:rounded-md we:text-sm we:font-normal',
    'we:transition-colors we:focus-visible:outline-none we:disabled:pointer-events-none we:disabled:opacity-50',
    'we:[&_svg]:pointer-events-none we:[&_svg]:h-4 we:[&_svg]:w-4 we:[&_svg]:shrink-0',
    'we:data-[active=true]:text-primary'
  ),
  {
    variants: {
      variant: {
        default: 'we:bg-primary we:text-primary-foreground hover:we:bg-primary/90',
        destructive: 'we:bg-destructive we:text-destructive-foreground we:hover:bg-destructive/90',
        outline: 'we:border we:border-input we:bg-background we:shadow-sm we:hover:bg-accent',
        secondary: 'we:bg-secondary we:text-secondary-foreground we:hover:bg-secondary/80',
        ghost: 'we:text-foreground we:hover:bg-accent',
        link: 'we:text-primary we:underline-offset-4 we:hover:underline',
      },
      size: {
        default: 'we:h-8 we:p-2',
        sm: 'we:h-6 we:rounded-md we:px-3 we:text-xs',
        lg: 'we:h-10 we:rounded-md we:px-8',
        icon: 'we:p-1 we:justify-center',
      },
      justify: {
        center: 'we:justify-center',
        start: 'we:justify-start',
        end: 'we:justify-end',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'default',
      justify: 'center',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  tooltip?: string;
  isActive?: boolean;
  activeClassName?: string;
  iconActiveClassName?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, justify, asChild = false, isActive = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ className, variant, size, justify }))}
        data-active={isActive}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
