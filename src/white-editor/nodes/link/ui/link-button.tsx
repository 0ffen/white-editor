import React from 'react';
import { getTranslate } from '@/shared';
import { Button, type ButtonProps } from '@/shared/components';

export const LinkButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, children, ...props }, ref) => {
  return (
    <Button
      type='button'
      size='icon'
      className={className}
      data-style='ghost'
      role='button'
      tabIndex={-1}
      aria-label='Link'
      tooltip={getTranslate('link')}
      ref={ref}
      {...props}
    >
      {children}
    </Button>
  );
});

LinkButton.displayName = 'LinkButton';
