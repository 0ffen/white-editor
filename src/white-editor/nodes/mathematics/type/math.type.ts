import type { ButtonProps } from '@/shared/components';
import type { Editor } from '@tiptap/react';

interface MathematicsConfig {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
  onSetMath?: () => void;
}

interface MathHandlerProps {
  editor: Editor | null;
  onSetMath?: () => void;
  type?: MathType;
}

interface MathPopoverProps extends Omit<ButtonProps, 'type'>, MathematicsConfig {
  className?: string;
  icon?: React.ReactNode;
  onOpenChange?: (isOpen: boolean) => void;
  placeholder?: string;
  mathPopoverClassName?: string;
  type?: 'block' | 'inline';
  readOnly?: boolean;
}

type MathType = 'block' | 'inline';

export type { MathType, MathematicsConfig, MathHandlerProps, MathPopoverProps };
