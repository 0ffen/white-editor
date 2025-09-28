import { useState, useCallback } from 'react';

export interface ImageHoverState {
  isHovered: boolean;
}

export interface ImageHoverHandlers {
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  setIsHovered: (hovered: boolean) => void;
}

export function useImageHover() {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const hoverState: ImageHoverState = {
    isHovered,
  };

  const hoverHandlers: ImageHoverHandlers = {
    handleMouseEnter,
    handleMouseLeave,
    setIsHovered,
  };

  return {
    hoverState,
    hoverHandlers,
  };
}
