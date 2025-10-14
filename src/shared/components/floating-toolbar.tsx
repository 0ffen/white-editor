import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/utils';
import { Toolbar, ToolbarGroup } from './toolbar';

interface FloatingToolbarProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  anchorElement: HTMLElement | null;
  className?: string;
  offset?: { x?: number; y?: number };
  placement?: 'bottom' | 'top' | 'left' | 'right';
}

export const FloatingToolbar = React.forwardRef<HTMLDivElement, FloatingToolbarProps>(
  ({ children, isOpen, anchorElement, className, offset = {}, placement = 'bottom' }, ref) => {
    const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null);
    const toolbarRef = React.useRef<HTMLDivElement>(null);

    // 위치 계산
    React.useLayoutEffect(() => {
      if (isOpen && anchorElement) {
        const updatePosition = () => {
          const rect = anchorElement.getBoundingClientRect();
          const toolbarRect = toolbarRef.current?.getBoundingClientRect();

          let top = rect.bottom + (offset.y ?? 4);
          let left = rect.left + (offset.x ?? 0);

          // placement에 따른 위치 조정
          switch (placement) {
            case 'top':
              top = rect.top - (toolbarRect?.height ?? 0) - (offset.y ?? 4);
              break;
            case 'bottom':
              top = rect.bottom + (offset.y ?? 4);
              break;
            case 'left':
              top = rect.top + (offset.y ?? 0);
              left = rect.left - (toolbarRect?.width ?? 0) - (offset.x ?? 4);
              break;
            case 'right':
              top = rect.top + (offset.y ?? 0);
              left = rect.right + (offset.x ?? 4);
              break;
          }

          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;

          if (toolbarRect) {
            if (left + toolbarRect.width > viewportWidth) {
              left = viewportWidth - toolbarRect.width - 8;
            }
            if (left < 8) {
              left = 8;
            }
            if (top + toolbarRect.height > viewportHeight) {
              top = rect.top - toolbarRect.height - 4;
            }
            if (top < 8) {
              top = rect.bottom + 4;
            }
          }
          setPosition({ top, left });
        };

        updatePosition();

        // 스크롤이나 리사이즈시 위치 재계산
        const handleUpdate = () => updatePosition();
        window.addEventListener('scroll', handleUpdate, true);
        window.addEventListener('resize', handleUpdate);

        return () => {
          window.removeEventListener('scroll', handleUpdate, true);
          window.removeEventListener('resize', handleUpdate);
        };
      } else {
        setPosition(null);
      }
    }, [isOpen, anchorElement, offset.x, offset.y, placement]);

    if (!isOpen || !position || typeof document === 'undefined') {
      return null;
    }

    const floatingToolbar = (
      <Toolbar
        ref={(node) => {
          toolbarRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        variant='floating'
        className={cn('we:bg-popover we:text-popover-foreground we:fixed we:z-50 we:border-0', className)}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          boxShadow: 'var(--we-popover-shadow)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <ToolbarGroup>{children}</ToolbarGroup>
      </Toolbar>
    );

    return createPortal(floatingToolbar, document.body);
  }
);

FloatingToolbar.displayName = 'FloatingToolbar';
