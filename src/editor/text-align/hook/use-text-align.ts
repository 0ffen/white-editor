import * as React from 'react';

import {
  TEXT_ALIGN_SHORTCUT_KEYS,
  textAlignIcons,
  textAlignLabels,
  type TextAlign,
  type UseTextAlignConfig,
} from '@/editor';
import { useTiptapEditor } from '@/hooks';
import { isExtensionAvailable, isNodeTypeSelected } from '@/utils';
import { type Editor } from '@tiptap/react';
import type { ChainedCommands } from '@tiptap/react';

export function canSetTextAlign(editor: Editor | null, align: TextAlign): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isExtensionAvailable(editor, 'textAlign') || isNodeTypeSelected(editor, ['image'])) return false;

  return editor.can().setTextAlign(align);
}

export function hasSetTextAlign(commands: ChainedCommands): commands is ChainedCommands & {
  setTextAlign: (align: TextAlign) => ChainedCommands;
} {
  return 'setTextAlign' in commands;
}

export function isTextAlignActive(editor: Editor | null, align: TextAlign): boolean {
  if (!editor || !editor.isEditable) return false;
  return editor.isActive({ textAlign: align });
}

export function setTextAlign(editor: Editor | null, align: TextAlign): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canSetTextAlign(editor, align)) return false;

  const chain = editor.chain().focus();
  if (hasSetTextAlign(chain)) {
    return chain.setTextAlign(align).run();
  }

  return false;
}

export function shouldShowTextAlignButton(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
  align: TextAlign;
}): boolean {
  const { editor, hideWhenUnavailable, align } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isExtensionAvailable(editor, 'textAlign')) return false;

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canSetTextAlign(editor, align);
  }

  return true;
}

export function useTextAlign(config: UseTextAlignConfig) {
  const { editor: providedEditor, align, hideWhenUnavailable = false, onAligned } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = React.useState<boolean>(true);
  const canAlign = canSetTextAlign(editor, align);
  const isActive = isTextAlignActive(editor, align);

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowTextAlignButton({ editor, align, hideWhenUnavailable }));
    };

    handleSelectionUpdate();

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable, align]);

  const handleTextAlign = React.useCallback(() => {
    if (!editor) return false;

    const success = setTextAlign(editor, align);
    if (success) {
      onAligned?.();
    }
    return success;
  }, [editor, align, onAligned]);

  return {
    isVisible,
    isActive,
    handleTextAlign,
    canAlign,
    label: textAlignLabels[align],
    shortcutKeys: TEXT_ALIGN_SHORTCUT_KEYS[align],
    Icon: textAlignIcons[align],
  };
}
