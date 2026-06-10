import * as React from 'react';
import { X } from 'lucide-react';

import { cn } from '@/shared/utils/utils';
import { usePortalContainer } from '@/shared/contexts';
import * as DialogPrimitive from '@radix-ui/react-dialog';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, onClick, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'we:data-[state=open]:animate-in we:data-[state=closed]:animate-out we:data-[state=closed]:fade-out-0 we:data-[state=open]:fade-in-0 we:fixed we:inset-0 we:z-overlay we:bg-[var(--Neutral-Opacity-Light-40,rgba(22,22,22,0.4))]',
      className
    )}
    // portal로 에디터 서브트리 안에 렌더되므로, 오버레이 클릭이 에디터(.white-editor)의
    // click-to-focus 핸들러로 버블링되지 않도록 전파를 막는다.
    onClick={(e) => {
      e.stopPropagation();
      onClick?.(e);
    }}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** true이면 닫기(X) 버튼 숨김 */
  hideCloseButton?: boolean;
  /** 오버레이 배경 커스텀 (예: 이미지 뷰어용 Neutral Opacity/Light/40) */
  overlayClassName?: string;
}

const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DialogContentProps>(
  ({ className, children, hideCloseButton = false, overlayClassName, onClick, ...props }, ref) => {
    const portalContainer = usePortalContainer();

    return (
      <DialogPortal container={portalContainer}>
        <DialogOverlay className={overlayClassName} />
        <DialogPrimitive.Content
          aria-describedby={props['aria-describedby']}
          ref={ref}
          tabIndex={-1}
          // 모달 내부 클릭이 에디터 click-to-focus로 버블링되지 않도록 전파를 막는다.
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(e);
          }}
          className={cn(
            'we:bg-elevation-background we:data-[state=open]:animate-in we:data-[state=closed]:animate-out we:data-[state=closed]:fade-out-0 we:data-[state=open]:fade-in-0 we:data-[state=closed]:zoom-out-95 we:data-[state=open]:zoom-in-95 we:fixed we:top-[50%] we:left-[50%] we:z-modal we:mx-4 we:grid we:w-full we:max-w-lg we:translate-x-[-50%] we:translate-y-[-50%] we:gap-4 we:overflow-y-auto we:rounded-lg we:p-6 we:shadow-lg we:duration-200 we:outline-none we:focus:outline-none we:focus-visible:outline-none we:focus-visible:ring-0',
            className
          )}
          {...props}
        >
          {children}
          {!hideCloseButton && (
            <DialogPrimitive.Close className='we:cursor-pointer we:ring-offset-elevation-background we:focus:we:none we:data-[state=open]:bg-elevation-level1 we:data-[state=open]:text-text-normal we:absolute we:top-4 we:right-4 we:rounded-sm we:opacity-70 we:transition-opacity we:hover:opacity-100 we:focus:outline-none we:disabled:pointer-events-none'>
              <X className='we:h-4 we:w-4' />
              <span className='we:sr-only'>Close</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  }
);
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
    className={cn('we:text-[18px] we:text-text-normal we:leading-none we:font-medium we:tracking-tight', className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('we:text-text-sub we:text-sm', className)} {...props} />
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
