import * as React from 'react';

import { useTiptapEditor } from '@/shared/hooks';
import { isTableActive, shouldShowTableButton, type TableActionItem } from '@/white-editor';
import type { Editor } from '@tiptap/react';

export interface UseTableDropdownMenuConfig {
  editor?: Editor | null;
  actions?: TableActionItem[];
  hideWhenUnavailable?: boolean;
}

const getActiveTableAction = (editor: Editor | null, actions: TableActionItem[] = []): TableActionItem | undefined => {
  if (!editor || !editor.isEditable) return undefined;

  if (isTableActive(editor)) {
    const availableActions = actions.filter((action) => {
      switch (action.action) {
        case 'insertTable':
          return false;
        default:
          return true;
      }
    });
    return availableActions[0];
  }

  return actions.find((action) => action.action === 'insertTable');
};

// 테이블 액션 실행 함수
const executeTableAction = (editor: Editor, action: string) => {
  if (!editor || !editor.isEditable) return;

  const chain = editor.chain().focus();

  switch (action) {
    case 'insertTable':
      chain.insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run();
      break;
    case 'addColumnBefore':
      chain.addColumnBefore().run();
      break;
    case 'addColumnAfter':
      chain.addColumnAfter().run();
      break;
    case 'deleteColumn':
      chain.deleteColumn().run();
      break;
    case 'addRowBefore':
      chain.addRowBefore().run();
      break;
    case 'addRowAfter':
      chain.addRowAfter().run();
      break;
    case 'deleteRow':
      chain.deleteRow().run();
      break;
    case 'toggleHeaderColumn':
      chain.toggleHeaderColumn().run();
      break;
    case 'toggleHeaderRow':
      chain.toggleHeaderRow().run();
      break;
    case 'mergeCells':
      chain.mergeCells().run();
      break;
    case 'splitCell':
      chain.splitCell().run();
      break;
    case 'deleteTable':
      chain.deleteTable().run();
      break;
    default:
      // eslint-disable-next-line no-console
      console.warn(`Unknown table action: ${action}`);
  }
};

// 액션 사용 가능 여부 체크
const canExecuteAction = (editor: Editor | null, action: string): boolean => {
  if (!editor || !editor.isEditable) return false;

  switch (action) {
    case 'insertTable':
      return editor.can().insertContent({ type: 'table' });
    case 'addColumnBefore':
      return editor.can().addColumnBefore();
    case 'addColumnAfter':
      return editor.can().addColumnAfter();
    case 'deleteColumn':
      return editor.can().deleteColumn();
    case 'addRowBefore':
      return editor.can().addRowBefore();
    case 'addRowAfter':
      return editor.can().addRowAfter();
    case 'deleteRow':
      return editor.can().deleteRow();
    case 'toggleHeaderColumn':
      return editor.can().toggleHeaderColumn();
    case 'toggleHeaderRow':
      return editor.can().toggleHeaderRow();
    case 'mergeCells':
      return editor.can().mergeCells();
    case 'splitCell':
      return editor.can().splitCell();
    case 'deleteTable':
      return editor.can().deleteTable();
    default:
      return false;
  }
};

const useTableToolbar = (config?: UseTableDropdownMenuConfig) => {
  const { editor: providedEditor, actions = [], hideWhenUnavailable = false } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = React.useState(true);

  const activeAction = getActiveTableAction(editor, actions);
  const isActive = isTableActive(editor);
  const canToggle = editor?.can().insertTable() || isActive;

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

  return {
    isVisible,
    activeAction,
    isActive,
    canToggle,
    actions,
  };
};

export { canExecuteAction, executeTableAction, useTableToolbar, getActiveTableAction };
