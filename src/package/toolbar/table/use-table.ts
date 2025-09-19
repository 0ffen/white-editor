import React from 'react';
import { Table } from 'lucide-react';
import { useTiptapEditor } from '@/hooks';
import { isExtensionAvailable, isNodeTypeSelected } from '@/utils';
import type { Editor } from '@tiptap/react';

export interface UseTableConfig {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
  onInserted?: () => void;
}

const canAddTable = (editor: Editor | null): boolean => {
  if (!editor || !editor.isEditable) return false;
  if (!isExtensionAvailable(editor, 'imageUpload') || isNodeTypeSelected(editor, ['image'])) return false;

  return editor.can().insertContent({ type: 'table' });
};

const addColumn = (editor: Editor | null) => {
  if (!editor || !editor.isEditable) return false;
  if (!canAddTable(editor)) return false;

  editor.chain().focus().addColumnAfter().run();
};

export function isTableActive(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  return editor.isActive('table');
}

const insertNewTable = (editor: Editor | null) => {
  if (!editor || !editor.isEditable) return false;
  if (!canAddTable(editor)) return false;

  try {
    return editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  } catch {
    return false;
  }
};

export function shouldShowTableButton(props: { editor: Editor | null; hideWhenUnavailable: boolean }): boolean {
  const { editor, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isExtensionAvailable(editor, 'table')) return false;

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canAddTable(editor);
  }

  return true;
}

export function useTable(config: UseTableConfig) {
  const { editor: providedEditor, hideWhenUnavailable = false, onInserted } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = React.useState<boolean>(true);
  const canInsert = canAddTable(editor);
  const isActive = isTableActive(editor);

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowTableButton({ editor, hideWhenUnavailable }));
    };

    handleSelectionUpdate();

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  const handleTable = React.useCallback(() => {
    if (!editor) return false;

    const success = insertNewTable(editor);
    if (success) {
      onInserted?.();
    }
    return success;
  }, [editor, onInserted]);

  return {
    isVisible,
    isActive,
    handleTable,
    canInsert,
    label: 'Table',
    Icon: Table,
  };
}

export { canAddTable, addColumn, insertNewTable };
