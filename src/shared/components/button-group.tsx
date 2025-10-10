import React from 'react';
import { cn } from '@/shared/utils/utils';

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
        'we:relative we:flex we:align-middle',
        orientation === 'vertical'
          ? 'we:min-w-max we:flex-col we:items-start we:justify-center we:[&>*]:w-full'
          : 'we:flex-row we:items-center we:gap-0.5',
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
