import * as React from 'react';
import { cn } from '@/shared/utils/utils';
import * as SeparatorPrimitive from '@radix-ui/react-separator';

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot='separator'
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'we:bg-border-default we:mx-3 we:shrink-0 we:data-[orientation=horizontal]:h-px we:data-[orientation=horizontal]:w-1/3 we:data-[orientation=vertical]:h-full we:data-[orientation=vertical]:w-px',
        className
      )}
      {...props}
    />
  );
}

export { Separator };
