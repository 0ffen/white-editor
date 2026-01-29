import * as React from 'react';

import { useTiptapEditor } from '@/shared/hooks';

import { isNodeInSchema, isNodeTypeSelected } from '@/shared/utils';
import { listIcons, listLabels, type ListType, type UseListConfig } from '@/white-editor';
import { type Editor } from '@tiptap/react';

/** Block types that can be converted to list (paragraph, blockquote, any list). */
function isInConvertibleBlock(editor: Editor | null): boolean {
  if (!editor) return false;
  return (
    editor.isActive('paragraph') ||
    editor.isActive('blockquote') ||
    editor.isActive('bulletList') ||
    editor.isActive('orderedList') ||
    editor.isActive('taskList')
  );
}

export function canToggleList(editor: Editor | null, type: ListType): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isNodeInSchema(type, editor) || isNodeTypeSelected(editor, ['image'])) return false;
  if (editor.isActive('code')) return false;

  // Enable when in any block that can be converted to list (so user can switch between list/blockquote).
  if (!isInConvertibleBlock(editor)) return false;

  switch (type) {
    case 'bulletList':
      return editor.can().toggleBulletList() || editor.isActive('orderedList') || editor.isActive('blockquote');
    case 'orderedList':
      return editor.can().toggleOrderedList() || editor.isActive('bulletList') || editor.isActive('blockquote');
    case 'taskList':
      return (
        editor.can().toggleList('taskList', 'taskItem') ||
        editor.isActive('bulletList') ||
        editor.isActive('orderedList') ||
        editor.isActive('blockquote')
      );
    default:
      return false;
  }
}

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
 * Toggle list on/off using only Tiptap's native toggle commands.
 * Custom NodeSelection + clearNodes + lift caused duplicate empty paragraph nodes.
 */
export function toggleList(editor: Editor | null, type: ListType): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canToggleList(editor, type)) return false;

  const toggleMap: Record<ListType, () => ReturnType<Editor['chain']>> = {
    bulletList: () => editor.chain().focus().toggleBulletList(),
    orderedList: () => editor.chain().focus().toggleOrderedList(),
    taskList: () => editor.chain().focus().toggleList('taskList', 'taskItem'),
  };
  const toggle = toggleMap[type];
  if (!toggle) return false;

  const success = toggle().run();
  return success;
}

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

export function useList(config: UseListConfig) {
  const { editor: providedEditor, type, hideWhenUnavailable = false, onToggled } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = React.useState<boolean>(true);

  const canToggle = type ? canToggleList(editor, type) : false;
  const isActive = type ? isListActive(editor, type) : false;

  React.useEffect(() => {
    if (!editor || !type) return;

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
    if (!editor || !type) return false;

    const success = toggleList(editor, type);
    if (success) {
      onToggled?.();
    }
    return success;
  }, [editor, type, onToggled]);

  if (!type) {
    return {
      isVisible: false,
      isActive: false,
      handleToggle: () => false,
      canToggle: false,
      label: '',
      Icon: null,
    };
  }

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle,
    label: listLabels[type],
    Icon: listIcons[type],
  };
}
