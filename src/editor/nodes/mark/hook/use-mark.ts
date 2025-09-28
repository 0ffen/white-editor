import * as React from 'react';

import { MARK_SHORTCUT_KEYS, markIcons, type Mark, type UseMarkConfig } from '@/editor';
import { useTiptapEditor } from '@/shared/hooks';
import { isMarkInSchema, isNodeTypeSelected } from '@/shared/utils';
import type { Editor } from '@tiptap/react';

export function canToggleMark(editor: Editor | null, type: Mark): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isMarkInSchema(type, editor) || isNodeTypeSelected(editor, ['image'])) return false;

  return editor.can().toggleMark(type);
}

export function isMarkActive(editor: Editor | null, type: Mark): boolean {
  if (!editor || !editor.isEditable) return false;
  return editor.isActive(type);
}

export function toggleMark(editor: Editor | null, type: Mark): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canToggleMark(editor, type)) return false;

  return editor.chain().focus().toggleMark(type).run();
}

export function shouldShowMarkButton(props: {
  editor: Editor | null;
  type: Mark;
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, type, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isMarkInSchema(type, editor)) return false;

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canToggleMark(editor, type);
  }

  return true;
}

export function getFormattedMarkName(type: Mark): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function useMark(config: UseMarkConfig) {
  const { editor: providedEditor, type, hideWhenUnavailable = false, onToggled } = config;
  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = React.useState<boolean>(true);

  const canToggle = canToggleMark(editor, type!);
  const isActive = isMarkActive(editor, type!);

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowMarkButton({ editor, type: type!, hideWhenUnavailable }));
    };

    handleSelectionUpdate();

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, type, hideWhenUnavailable]);

  const handleMark = React.useCallback(() => {
    if (!editor) return false;

    const success = toggleMark(editor, type!);
    if (success) {
      onToggled?.();
    }
    return success;
  }, [editor, type, onToggled]);

  return {
    isVisible,
    isActive,
    handleMark,
    canToggle,
    label: getFormattedMarkName(type!),
    shortcutKeys: MARK_SHORTCUT_KEYS[type!],
    Icon: markIcons[type!],
  };
}
