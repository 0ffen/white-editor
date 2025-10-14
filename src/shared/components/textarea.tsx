import * as React from 'react';

import { cn } from '@/shared/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'we:border-input placeholder:we:text-input we:flex we:min-h-[60px] we:w-full we:rounded-md we:border we:bg-transparent we:px-3 we:py-2 we:text-sm we:focus-visible:outline-none we:disabled:cursor-not-allowed we:disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
