import * as React from 'react';

import { ListIcon, ListOrderedIcon, ListTodoIcon, type LucideProps } from 'lucide-react';
import { useTiptapEditor } from '@/hooks';

import { findNodePosition, isNodeInSchema, isNodeTypeSelected, isValidPosition } from '@/utils';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import { type Editor } from '@tiptap/react';

export type ListType = 'bulletList' | 'orderedList' | 'taskList';
export type ListOptions = {
  [key in ListType]: {
    label: string;
    Icon: React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>;
  };
};

export interface UseListConfig {
  editor?: Editor | null;
  type: ListType;
  hideWhenUnavailable?: boolean;
  listOptions?: ListOptions[];
  onToggled?: () => void;
}

export const listLabels: Record<ListType, string> = {
  bulletList: 'unordered list',
  orderedList: 'ordered list',
  taskList: 'task list',
};

export const listIcons = {
  bulletList: ListIcon,
  orderedList: ListOrderedIcon,
  taskList: ListTodoIcon,
};

/**
 * Checks if a list can be toggled in the current editor state
 */
export function canToggleList(editor: Editor | null, type: ListType, turnInto: boolean = true): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isNodeInSchema(type, editor) || isNodeTypeSelected(editor, ['image'])) return false;

  if (!turnInto) {
    switch (type) {
      case 'bulletList':
        return editor.can().toggleBulletList();
      case 'orderedList':
        return editor.can().toggleOrderedList();
      case 'taskList':
        return editor.can().toggleList('taskList', 'taskItem');
      default:
        return false;
    }
  }

  try {
    const view = editor.view;
    const state = view.state;
    const selection = state.selection;

    if (selection.empty || selection instanceof TextSelection) {
      const pos = findNodePosition({
        editor,
        node: state.selection.$anchor.node(1),
      })?.pos;
      if (!isValidPosition(pos)) return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if list is currently active
 */
export function isListActive(editor: Editor | null, type: ListType): boolean {
  if (!editor || !editor.isEditable) return false;

  switch (type) {
    case 'bulletList':
      return editor.isActive('bulletList');
    case 'orderedList':
      return editor.isActive('orderedList');
    case 'taskList':
      return editor.isActive('taskList');
    default:
      return false;
  }
}

/**
 * Toggles list in the editor
 */
export function toggleList(editor: Editor | null, type: ListType): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canToggleList(editor, type)) return false;

  try {
    const view = editor.view;
    let state = view.state;
    let tr = state.tr;

    // No selection, find the the cursor position
    if (state.selection.empty || state.selection instanceof TextSelection) {
      const pos = findNodePosition({
        editor,
        node: state.selection.$anchor.node(1),
      })?.pos;
      if (!isValidPosition(pos)) return false;

      tr = tr.setSelection(NodeSelection.create(state.doc, pos));
      view.dispatch(tr);
      state = view.state;
    }

    const selection = state.selection;

    let chain = editor.chain().focus();

    // Handle NodeSelection
    if (selection instanceof NodeSelection) {
      const firstChild = selection.node.firstChild?.firstChild;
      const lastChild = selection.node.lastChild?.lastChild;

      const from = firstChild ? selection.from + firstChild.nodeSize : selection.from + 1;

      const to = lastChild ? selection.to - lastChild.nodeSize : selection.to - 1;

      chain = chain.setTextSelection({ from, to }).clearNodes();
    }

    if (editor.isActive(type)) {
      // Unwrap list
      chain.liftListItem('listItem').lift('bulletList').lift('orderedList').lift('taskList').run();
    } else {
      // Wrap in specific list type
      const toggleMap: Record<ListType, () => typeof chain> = {
        bulletList: () => chain.toggleBulletList(),
        orderedList: () => chain.toggleOrderedList(),
        taskList: () => chain.toggleList('taskList', 'taskItem'),
      };

      const toggle = toggleMap[type];
      if (!toggle) return false;

      toggle().run();
    }

    editor.chain().focus().selectTextblockEnd().run();

    return true;
  } catch {
    return false;
  }
}

/**
 * Determines if the list button should be shown
 */
export function shouldShowListButton(props: {
  editor: Editor | null;
  type: ListType;
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, type, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isNodeInSchema(type, editor)) return false;

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canToggleList(editor, type);
  }

  return true;
}

/**
 * Custom hook that provides list functionality for Tiptap editor
 *
 * @example
 * ```tsx
 * // Simple usage
 * function MySimpleListButton() {
 *   const { isVisible, handleToggle, isActive } = useList({ type: "bulletList" })
 *
 *   if (!isVisible) return null
 *
 *   return <button onClick={handleToggle}>Bullet List</button>
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedListButton() {
 *   const { isVisible, handleToggle, label, isActive } = useList({
 *     type: "orderedList",
 *     editor: myEditor,
 *     hideWhenUnavailable: true,
 *     onToggled: () => console.log('List toggled!')
 *   })
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <MyButton
 *       onClick={handleToggle}
 *       aria-label={label}
 *       aria-pressed={isActive}
 *     >
 *       Toggle List
 *     </MyButton>
 *   )
 * }
 * ```
 */
export function useList(config: UseListConfig) {
  const { editor: providedEditor, type, hideWhenUnavailable = false, onToggled, listOptions } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = React.useState<boolean>(true);
  const canToggle = canToggleList(editor, type);
  const isActive = isListActive(editor, type);

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowListButton({ editor, type, hideWhenUnavailable }));
    };

    handleSelectionUpdate();

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, type, hideWhenUnavailable]);

  const handleToggle = React.useCallback(() => {
    if (!editor) return false;

    const success = toggleList(editor, type);
    if (success) {
      onToggled?.();
    }
    return success;
  }, [editor, type, onToggled]);

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle,
    // label: listOptions?[type] || listLabels[type],
    // Icon: listOptions?[type].icon || listIcons[type],
    label: listLabels[type],
    Icon: listIcons[type],
  };
}
