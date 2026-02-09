import * as React from 'react';

import { useTiptapEditor } from '@/shared/hooks';
import {
  canToggle,
  isHeadingActive,
  shouldShowHeadingButton,
  type Level,
  type UseHeadingDropdownMenuConfig,
} from '@/white-editor';
import type { Editor } from '@tiptap/react';

export function getActiveHeadingLevel(editor: Editor | null, levels: Level[] = [1, 2, 3, 4, 5, 6]): Level | undefined {
  if (!editor || !editor.isEditable) return undefined;
  return levels.find((level) => isHeadingActive(editor, level));
}

export function useHeadingDropdownMenu(config?: UseHeadingDropdownMenuConfig) {
  const { editor: providedEditor, levels = [1, 2, 3, 4, 5, 6], hideWhenUnavailable = false } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = React.useState(true);

  const activeLevel = getActiveHeadingLevel(editor, levels);
  const canToggleState = canToggle(editor);

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowHeadingButton({ editor, hideWhenUnavailable, level: levels }));
    };

    handleSelectionUpdate();

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable, levels]);

  return {
    isVisible,
    activeLevel,
    canToggle: canToggleState,
    levels,
    label: `Heading ${activeLevel}`,
  };
}
