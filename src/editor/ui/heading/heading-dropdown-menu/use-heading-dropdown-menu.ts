import * as React from 'react';

import { useTiptapEditor } from '@/hooks/use-tiptap-editor';
import type { Editor } from '@tiptap/react';
import { canToggle, isHeadingActive, shouldShowHeadingButton } from '../heading-button';
import type { Level } from '../heading.type';

export interface UseHeadingDropdownMenuConfig {
  editor?: Editor | null;
  levels?: Level[];
  hideWhenUnavailable?: boolean;
}

export function getActiveHeadingLevel(editor: Editor | null, levels: Level[] = [1, 2, 3, 4, 5, 6]): Level | undefined {
  if (!editor || !editor.isEditable) return undefined;
  return levels.find((level) => isHeadingActive(editor, level));
}

export function useHeadingDropdownMenu(config?: UseHeadingDropdownMenuConfig) {
  const { editor: providedEditor, levels = [1, 2, 3, 4, 5, 6], hideWhenUnavailable = false } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = React.useState(true);

  const activeLevel = getActiveHeadingLevel(editor, levels);
  const isActive = isHeadingActive(editor);
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
    isActive,
    canToggle: canToggleState,
    levels,
    label: `Heading ${activeLevel}`,
  };
}

/**
 * Custom hook that provides heading dropdown menu functionality for Tiptap editor
 *
 * @example
 * ```tsx
 * // Simple usage
 * function MyHeadingDropdown() {
 *   const {
 *     isVisible,
 *     activeLevel,
 *     isAnyHeadingActive,
 *     canToggle,
 *     levels,
 *   } = useHeadingDropdownMenu()
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <DropdownMenu>
 *       // dropdown content
 *     </DropdownMenu>
 *   )
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedHeadingDropdown() {
 *   const {
 *     isVisible,
 *     activeLevel,
 *   } = useHeadingDropdownMenu({
 *     editor: myEditor,
 *     levels: [1, 2, 3],
 *     hideWhenUnavailable: true,
 *   })
 *
 *   // component implementation
 * }
 * ```
 */
