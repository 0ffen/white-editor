import React from 'react';
import { useTranslate } from '@/shared';
import { Button, type ButtonProps } from '@/shared/components';

export const LinkButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, children, ...props }, ref) => {
  const t = useTranslate();
  return (
    <Button
      type='button'
      size='icon'
      className={className}
      data-style='ghost'
      role='button'
      tabIndex={-1}
      aria-label='Link'
      tooltip={t('link')}
      ref={ref}
      {...props}
    >
      {children}
    </Button>
  );
});

LinkButton.displayName = 'LinkButton';
