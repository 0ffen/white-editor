import * as React from 'react';

import { useTiptapEditor } from '@/shared/hooks';
import { isNodeTypeSelected } from '@/shared/utils';
import {
  type UndoRedoAction,
  historyActionLabels,
  historyIcons,
  UNDO_REDO_SHORTCUT_KEYS,
  type UseUndoRedoConfig,
} from '@/white-editor';
import { type Editor } from '@tiptap/react';

export function canExecuteUndoRedoAction(editor: Editor | null, action: UndoRedoAction): boolean {
  if (!editor || !editor.isEditable) return false;
  if (isNodeTypeSelected(editor, ['image'])) return false;

  return action === 'undo' ? editor.can().undo() : editor.can().redo();
}

export function executeUndoRedoAction(editor: Editor | null, action: UndoRedoAction): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canExecuteUndoRedoAction(editor, action)) return false;

  const chain = editor.chain().focus();
  return action === 'undo' ? chain.undo().run() : chain.redo().run();
}

export function shouldShowUndoButton(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
  action: UndoRedoAction;
}): boolean {
  const { editor, hideWhenUnavailable, action } = props;

  if (!editor || !editor.isEditable) return false;

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canExecuteUndoRedoAction(editor, action);
  }

  return true;
}

export function useUndoRedo(config: UseUndoRedoConfig) {
  const { editor: providedEditor, action, hideWhenUnavailable = false, onExecuted } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = React.useState<boolean>(true);
  const canExecute = canExecuteUndoRedoAction(editor, action!);

  React.useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      setIsVisible(shouldShowUndoButton({ editor, hideWhenUnavailable, action: action! }));
    };

    handleUpdate();

    editor.on('transaction', handleUpdate);

    return () => {
      editor.off('transaction', handleUpdate);
    };
  }, [editor, hideWhenUnavailable, action]);

  const handleAction = React.useCallback(() => {
    if (!editor) return false;

    const success = executeUndoRedoAction(editor, action!);
    if (success) {
      onExecuted?.();
    }
    return success;
  }, [editor, action, onExecuted]);

  return {
    isVisible,
    handleAction,
    canExecute,
    label: historyActionLabels[action!],
    shortcutKeys: UNDO_REDO_SHORTCUT_KEYS[action!],
    Icon: historyIcons[action!],
  };
}
