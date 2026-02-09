import * as React from 'react';

import { TextQuote } from 'lucide-react';
import { useTiptapEditor } from '@/shared/hooks';
import { isNodeInSchema, isNodeTypeSelected } from '@/shared/utils';
import type { Editor } from '@tiptap/react';

export const BLOCKQUOTE_SHORTCUT_KEY = 'mod+shift+b';

export interface UseBlockquoteConfig {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
  onToggled?: () => void;
}

/** Block types that can be converted to blockquote (paragraph, blockquote, any list). */
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

export function canToggleBlockquote(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isNodeInSchema('blockquote', editor) || isNodeTypeSelected(editor, ['image'])) return false;
  if (editor.isActive('code')) return false;

  // Enable when in any block that can be converted to blockquote (so user can switch between list/blockquote).
  return editor.can().toggleWrap('blockquote') || isInConvertibleBlock(editor);
}

/**
 * Toggle blockquote on/off using only Tiptap's native toggleWrap command.
 * Custom NodeSelection + clearNodes + lift caused duplicate empty paragraph nodes.
 */
export function toggleBlockquote(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canToggleBlockquote(editor)) return false;

  const success = editor.chain().focus().toggleWrap('blockquote').run();
  return success;
}

function shouldShowButton(props: { editor: Editor | null; hideWhenUnavailable: boolean }): boolean {
  const { editor, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isNodeInSchema('blockquote', editor)) return false;

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canToggleBlockquote(editor);
  }

  return true;
}

export function useBlockquote(config?: UseBlockquoteConfig) {
  const { editor: providedEditor, hideWhenUnavailable = false, onToggled } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = React.useState<boolean>(true);
  const canToggle = canToggleBlockquote(editor);
  const isActive = editor?.isActive('blockquote') || false;

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, hideWhenUnavailable }));
    };

    handleSelectionUpdate();

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  const handleToggle = React.useCallback(() => {
    if (!editor) return false;

    const success = toggleBlockquote(editor);
    if (success) {
      onToggled?.();
    }
    return success;
  }, [editor, onToggled]);

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle,
    label: 'Blockquote',
    shortcutKeys: BLOCKQUOTE_SHORTCUT_KEY,
    Icon: TextQuote,
  };
}
