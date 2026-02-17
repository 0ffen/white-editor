import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/utils';
import { usePortalContainer } from '@/shared/contexts';
import { Toolbar, ToolbarGroup } from './toolbar';

interface FloatingToolbarProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  /** 실제 DOM 엘리먼트 기준 위치 (anchorElement 우선) */
  anchorElement?: HTMLElement | null;
  /** 가상 앵커 (선택 영역 등). 매번 호출해 최신 rect 사용 */
  getAnchorRect?: () => DOMRect | null;
  className?: string;
  offset?: { x?: number; y?: number };
  placement?: 'bottom' | 'top' | 'left' | 'right';
  /** 툴바에 넘길 추가 style (fade 등) */
  style?: React.CSSProperties;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
}

export const FloatingToolbar = React.forwardRef<HTMLDivElement, FloatingToolbarProps>(
  (
    {
      children,
      isOpen,
      anchorElement = null,
      getAnchorRect,
      className,
      offset = {},
      placement = 'bottom',
      style: styleProp,
      onMouseDown,
    },
    ref
  ) => {
    const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null);
    const toolbarRef = React.useRef<HTMLDivElement>(null);
    const portalContainer = usePortalContainer();

    const hasAnchor = Boolean(anchorElement || getAnchorRect);

    // 위치 계산
    React.useLayoutEffect(() => {
      if (isOpen && hasAnchor) {
        const updatePosition = () => {
          const rect = anchorElement ? anchorElement.getBoundingClientRect() : (getAnchorRect?.() ?? null);
          if (!rect) {
            setPosition(null);
            return;
          }
          const toolbarRect = toolbarRef.current?.getBoundingClientRect();
          // 첫 렌더 시 툴바가 아직 없어 높이를 모를 때 사용할 예상 높이 (텍스트 가림 방지)
          const estimatedToolbarHeight = 40;

          let top = rect.bottom + (offset.y ?? 4);
          let left = rect.left + (offset.x ?? 0);

          // placement에 따른 위치 조정
          switch (placement) {
            case 'top':
              top = rect.top - (toolbarRect?.height ?? estimatedToolbarHeight) - (offset.y ?? 4);
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

        // 첫 렌더 시 툴바가 아직 DOM에 없어 높이를 모르므로, 다음 프레임에 다시 계산
        const rafId = requestAnimationFrame(() => updatePosition());

        // 스크롤이나 리사이즈시 위치 재계산
        const handleUpdate = () => updatePosition();
        window.addEventListener('scroll', handleUpdate, true);
        window.addEventListener('resize', handleUpdate);

        return () => {
          cancelAnimationFrame(rafId);
          window.removeEventListener('scroll', handleUpdate, true);
          window.removeEventListener('resize', handleUpdate);
        };
      } else {
        setPosition(null);
      }
    }, [isOpen, hasAnchor, anchorElement, getAnchorRect, offset.x, offset.y, placement]);

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
        className={cn(className)}
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`,
          ...styleProp,
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={onMouseDown}
      >
        <ToolbarGroup>{children}</ToolbarGroup>
      </Toolbar>
    );

    return createPortal(floatingToolbar, portalContainer ?? document.body);
  }
);

FloatingToolbar.displayName = 'FloatingToolbar';
