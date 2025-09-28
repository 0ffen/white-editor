import React from 'react';
import { Button, type ButtonProps } from '@/shared/components';

export const LinkButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, children, ...props }, ref) => {
  return (
    <Button
      type='button'
      className={className}
      data-style='ghost'
      role='button'
      tabIndex={-1}
      aria-label='Link'
      ref={ref}
      {...props}
    >
      {children}
    </Button>
  );
});

LinkButton.displayName = 'LinkButton';
