import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components';
import { cn } from '@/shared/utils/utils';
import { Slot } from '@radix-ui/react-slot';

const buttonVariants = cva(
  cn(
    'we:inline-flex we:items-center we:cursor-pointer we:text-text-normal',
    'we:data-[active=true]:bg-brand-weak we:data-[active=true]:text-brand-default we:data-[active=true]:[&_svg]:text-brand-default',
    'we:w-full we:justify-center we:gap-2 we:whitespace-nowrap we:rounded we:text-sm we:font-normal',
    'we:transition-colors we:outline-none we:focus:outline-none we:focus-visible:outline-none we:active:outline-none',
    'we:disabled:cursor-not-allowed we:disabled:opacity-90',
    'we:[&_svg]:pointer-events-none we:[&_svg]:size-5 we:[&_svg]:shrink-0'
  ),
  {
    variants: {
      variant: {
        default: 'we:bg-brand-default we:text-white',
        destructive: 'we:bg-red-weak we:text-red-default we:[&_svg]:text-red-default',
        outline:
          'we:border we:border-border-default we:bg-elevation-background we:shadow-sm we:hover:bg-elevation-level1',
        secondary: 'we:bg-elevation-level2 we:text-text-sub',
        ghost: 'we:text-text-sub we:hover:bg-interaction-hover',
        link: 'we:text-brand-default we:underline-offset-4 we:hover:underline',
      },
      size: {
        default: 'we:h-9 we:py-[9px] we:px-2',
        sm: 'we:h-6 we:rounded we:px-3 we:text-xs',
        lg: 'we:h-10 we:rounded we:px-4',
        icon: 'we:h-[28px] we:w-[28px] we:p-1 we:justify-center',
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
  ({ className, variant, size, justify, asChild = false, isActive = false, tooltip, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const button = (
      <Comp
        className={cn(buttonVariants({ className, variant, size, justify }))}
        data-active={isActive}
        ref={ref}
        {...props}
      />
    );

    if (tooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side='bottom'>
            <div className='we:flex we:flex-col we:items-center we:text-center'>{tooltip}</div>
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
