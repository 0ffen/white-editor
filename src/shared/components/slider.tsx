import * as React from 'react';
import { cn } from '@/shared';
import * as SliderPrimitive from '@radix-ui/react-slider';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn('we:relative we:flex we:w-full we:touch-none we:items-center we:select-none', className)}
    {...props}
  >
    <SliderPrimitive.Track className='we:bg-primary/20 we:relative we:h-1.5 we:w-full we:grow we:overflow-hidden we:rounded-full'>
      <SliderPrimitive.Range className='we:bg-primary we:absolute we:h-full' />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className='we:border-primary/50 we:bg-background we:focus-visible:we:ring-ring we:block we:h-4 we:w-4 we:rounded-full we:border we:shadow we:transition-colors we:focus-visible:we:ring-1 we:focus-visible:we:outline-none we:disabled:we:pointer-events-none we:disabled:we:opacity-50' />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
