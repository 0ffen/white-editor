import { Redo2Icon, Undo2Icon } from 'lucide-react';
import { type Editor } from '@tiptap/react';

type UndoRedoAction = 'undo' | 'redo';

interface UseUndoRedoConfig {
  editor?: Editor | null;
  action?: UndoRedoAction; //실행할 history action
  hideWhenUnavailable?: boolean;
  onExecuted?: () => void; //액션 성공시 호출하는 콜백함수
}

const UNDO_REDO_SHORTCUT_KEYS: Record<UndoRedoAction, string> = {
  undo: 'mod+z',
  redo: 'mod+shift+z',
};

const historyActionLabels: Record<UndoRedoAction, string> = {
  undo: 'Undo',
  redo: 'Redo',
};

const historyIcons = {
  undo: Undo2Icon,
  redo: Redo2Icon,
};

export type { UndoRedoAction, UseUndoRedoConfig };
export { UNDO_REDO_SHORTCUT_KEYS, historyActionLabels, historyIcons };
