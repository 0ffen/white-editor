import React from 'react';
import { cn } from '@/utils/utils';

export const ButtonGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    orientation?: 'horizontal' | 'vertical';
  }
>(({ className, children, orientation = 'vertical', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'relative flex align-middle',
        orientation === 'vertical'
          ? 'min-w-max flex-col items-start justify-center [&>*]:w-full'
          : 'flex-row items-center gap-0.5',
        className
      )}
      data-orientation={orientation}
      role='group'
      {...props}
    >
      {children}
    </div>
  );
});

ButtonGroup.displayName = 'ButtonGroup';
