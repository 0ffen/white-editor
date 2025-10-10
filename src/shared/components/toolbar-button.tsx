import * as React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger, Toggle } from '@/shared/components';
import { cn } from '@/shared/utils';
import type { TooltipContentProps } from '@radix-ui/react-tooltip';

interface ToolbarButtonProps extends React.ComponentProps<typeof Toggle> {
  isActive?: boolean;
  tooltip?: string;
  tooltipOptions?: TooltipContentProps;
}

export const ToolbarButton = ({
  isActive = false,
  children,
  tooltip,
  className,
  tooltipOptions,
  ...props
}: ToolbarButtonProps) => {
  const toggleButton = (
    <Toggle className={cn({ 'we:bg-accent': isActive }, className)} {...props}>
      {children}
    </Toggle>
  );

  if (!tooltip) {
    return toggleButton;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{toggleButton}</TooltipTrigger>
      <TooltipContent {...tooltipOptions}>
        <div className='we:flex we:flex-col we:items-center we:text-center'>{tooltip}</div>
      </TooltipContent>
    </Tooltip>
  );
};

ToolbarButton.displayName = 'ToolbarButton';
