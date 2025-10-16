import * as React from 'react';
import { X } from 'lucide-react';

import { cn } from '@/shared/utils/utils';
import * as DialogPrimitive from '@radix-ui/react-dialog';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'we:data-[state=open]:animate-in we:data-[state=closed]:animate-out we:data-[state=closed]:fade-out-0 we:data-[state=open]:fade-in-0 we:fixed we:inset-0 we:z-50 we:bg-black/80',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      aria-describedby={props['aria-describedby']}
      ref={ref}
      className={cn(
        'we:bg-background we:data-[state=open]:animate-in we:data-[state=closed]:animate-out we:data-[state=closed]:fade-out-0 we:data-[state=open]:fade-in-0 we:data-[state=closed]:zoom-out-95 we:data-[state=open]:zoom-in-95 we:fixed we:top-[50%] we:left-[50%] we:z-50 we:mx-4 we:grid we:w-full we:max-w-lg we:translate-x-[-50%] we:translate-y-[-50%] we:gap-4 we:overflow-y-auto we:rounded-lg we:border we:p-6 we:shadow-lg we:duration-200',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className='we:cursor-pointer we:ring-offset-background we:focus:we:ring-ring we:data-[state=open]:bg-accent we:data-[state=open]:text-muted-foreground we:absolute we:top-4 we:right-4 we:rounded-sm we:opacity-70 we:transition-opacity we:hover:opacity-100 we:focus:ring-2 we:focus:ring-offset-2 we:focus:outline-none we:disabled:pointer-events-none'>
        <X className='we:h-4 we:w-4' />
        <span className='we:sr-only'>Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('we:flex we:flex-col we:space-y-1.5 we:text-left', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('we:flex we:flex-row we:justify-end we:space-x-2', className)} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('we:text-lg we:leading-none we:font-semibold we:tracking-tight', className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('we:text-muted-foreground we:text-sm', className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
