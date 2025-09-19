import * as React from 'react';

import { cn } from '@/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'border-input file:text-foreground placeholder:text-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[12px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
