import * as React from 'react';

import { useTiptapEditor } from '@/shared/hooks';
import { findNodePosition, isNodeInSchema, isNodeTypeSelected, isValidPosition } from '@/shared/utils';
import type { Level, ParagraphVariant } from '@/white-editor';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import { type Editor } from '@tiptap/react';

export interface UseHeadingConfig {
  editor?: Editor | null;
  level: Level | null;
  paragraphVariant?: ParagraphVariant;
  hideWhenUnavailable?: boolean;
  onToggled?: () => void;
  label?: string;
}

export function canToggleHeading(editor: Editor | null, level?: Level | null, turnInto: boolean = true): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isNodeInSchema('heading', editor) || isNodeTypeSelected(editor, ['image'])) return false;

  if (!turnInto) {
    return level ? editor.can().setNode('heading', { level }) : editor.can().setNode('heading');
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

export function isHeadingActive(editor: Editor | null, level?: Level | Level[]): boolean {
  if (!editor || !editor.isEditable) return false;

  if (Array.isArray(level)) {
    return level.some((l) => editor.isActive('heading', { level: l }));
  }

  return level ? editor.isActive('heading', { level }) : editor.isActive('heading');
}

export function toggleHeading(editor: Editor | null, level: Level | Level[]): boolean {
  if (!editor || !editor.isEditable) return false;

  const levels = Array.isArray(level) ? level : [level];
  const toggleLevel = levels.find((l) => canToggleHeading(editor, l));

  if (!toggleLevel) return false;

  try {
    const view = editor.view;
    let state = view.state;
    let tr = state.tr;

    // No selection, find the cursor position
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

    const isActive = levels.some((l) => editor.isActive('heading', { level: l }));

    const toggle = isActive ? chain.setNode('paragraph') : chain.setNode('heading', { level: toggleLevel });

    toggle.run();

    editor.chain().focus().selectTextblockEnd().run();

    return true;
  } catch {
    return false;
  }
}

export function shouldShowHeadingButton(props: {
  editor: Editor | null;
  level?: Level | Level[];
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, level, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isNodeInSchema('heading', editor)) return false;

  if (hideWhenUnavailable && !editor.isActive('code')) {
    if (Array.isArray(level)) {
      return level.some((l) => canToggleHeading(editor, l));
    }
    return canToggleHeading(editor, level);
  }

  return true;
}

// Helper function to check if paragraph with specific variant is active
function isParagraphVariantActive(editor: Editor | null, variant: ParagraphVariant): boolean {
  if (!editor) return false;
  if (!editor.isActive('paragraph')) return false;
  const currentVariant = editor.getAttributes('paragraph').variant;
  // Default variant is 1 if not set
  return (currentVariant ?? 1) === variant;
}

export function useHeading(config: UseHeadingConfig) {
  const { editor: providedEditor, level, paragraphVariant, hideWhenUnavailable = false, onToggled, label } = config;

  const { editor } = useTiptapEditor(providedEditor);

  // Track active state with state variable that updates on editor changes
  const [isActive, setIsActive] = React.useState<boolean>(false);

  // For headings, use canToggleHeading; for paragraphs, check setParagraph
  const canToggleState = React.useMemo(() => {
    if (!editor || !editor.isEditable) return false;
    if (level !== null) {
      return canToggleHeading(editor, level);
    }
    // For paragraphs, always allow if editor is editable and not in code block
    return !editor.isActive('codeBlock');
  }, [editor, level]);

  const [isVisible, setIsVisible] = React.useState<boolean>(() => {
    if (!editor || !editor.isEditable) return false;
    // For paragraphs, always visible if editor is editable
    if (level === null) return true;
    return shouldShowHeadingButton({ editor, level, hideWhenUnavailable });
  });

  React.useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      // For paragraphs, always visible
      if (level === null) {
        setIsVisible(editor.isEditable);
      } else {
        setIsVisible(shouldShowHeadingButton({ editor, level, hideWhenUnavailable }));
      }

      // Update isActive state
      if (level !== null) {
        setIsActive(isHeadingActive(editor, level));
      } else {
        setIsActive(isParagraphVariantActive(editor, paragraphVariant ?? 1));
      }
    };

    handleUpdate();
    editor.on('selectionUpdate', handleUpdate);
    editor.on('transaction', handleUpdate);
    return () => {
      editor.off('selectionUpdate', handleUpdate);
      editor.off('transaction', handleUpdate);
    };
  }, [editor, level, paragraphVariant, hideWhenUnavailable]);

  const handleToggle = React.useCallback(() => {
    if (!editor) return false;

    if (level === null) {
      // Set paragraph with variant attribute using setNode
      const variant = paragraphVariant ?? 1;
      editor.chain().focus().setNode('paragraph', { variant }).run();
    } else {
      toggleHeading(editor, level);
    }

    onToggled?.();
    return true;
  }, [editor, level, paragraphVariant, onToggled]);

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle: canToggleState,
    label,
  };
}
