import { AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon } from 'lucide-react';
import { type Editor } from '@tiptap/react';

type TextAlign = 'left' | 'center' | 'right' | 'justify';

interface UseTextAlignConfig {
  editor?: Editor | null;
  align: TextAlign;
  hideWhenUnavailable?: boolean;
  onAligned?: () => void;
}

const TEXT_ALIGN_SHORTCUT_KEYS: Record<TextAlign, string> = {
  left: 'mod+shift+l',
  center: 'mod+shift+e',
  right: 'mod+shift+r',
  justify: 'mod+shift+j',
};

const textAlignIcons = {
  left: AlignLeftIcon,
  center: AlignCenterIcon,
  right: AlignRightIcon,
  justify: AlignJustifyIcon,
};

const textAlignLabels: Record<TextAlign, string> = {
  left: 'Align left',
  center: 'Align center',
  right: 'Align right',
  justify: 'Align justify',
};

export type { TextAlign, UseTextAlignConfig };
export { TEXT_ALIGN_SHORTCUT_KEYS, textAlignIcons, textAlignLabels };
