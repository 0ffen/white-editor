import * as React from 'react';

import { cn } from '@/shared/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'we:border-input we:file:text-foreground we:placeholder:text-input we:flex we:h-8 we:w-full we:rounded-md we:border we:bg-transparent we:px-3 we:py-1 we:text-sm we:file:border-0 we:file:bg-transparent we:file:text-sm we:file:font-medium we:focus-visible:outline-none we:disabled:cursor-not-allowed we:disabled:opacity-50',
          className
        )}
        disabled={props.disabled}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
