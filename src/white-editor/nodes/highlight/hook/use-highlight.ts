import * as React from 'react';
import { LucideHighlighter } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTiptapEditor } from '@/shared/hooks';
import { isMarkInSchema, isNodeTypeSelected } from '@/shared/utils';
import { COLOR_HIGHLIGHT_SHORTCUT_KEY, HIGHLIGHT_COLORS, type UseColorHighlightConfig } from '@/white-editor';
import { type Editor } from '@tiptap/react';

export function pickHighlightColorsByValue(values: string[]) {
  const colorMap = new Map(HIGHLIGHT_COLORS.map((color) => [color.value, color]));
  return values
    .map((value) => colorMap.get(value))
    .filter((color): color is (typeof HIGHLIGHT_COLORS)[number] => !!color);
}

export function canColorHighlight(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isMarkInSchema('highlight', editor) || isNodeTypeSelected(editor, ['image'])) return false;

  return editor.can().setMark('highlight');
}

export function isColorHighlightActive(editor: Editor | null, highlightColor?: string): boolean {
  if (!editor || !editor.isEditable) return false;
  return highlightColor ? editor.isActive('highlight', { color: highlightColor }) : editor.isActive('highlight');
}

export function removeHighlight(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canColorHighlight(editor)) return false;

  return editor.chain().focus().unsetMark('highlight').run();
}

export function shouldShowHighlightPickerButton(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isMarkInSchema('highlight', editor)) return false;

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canColorHighlight(editor);
  }

  return true;
}

export function useColorHighlight(config: UseColorHighlightConfig) {
  const { editor: providedEditor, label, highlightColor, hideWhenUnavailable = false, onApplied } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = React.useState<boolean>(true);
  const canColorHighlightState = canColorHighlight(editor);
  const isActive = isColorHighlightActive(editor, highlightColor?.value);

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowHighlightPickerButton({ editor, hideWhenUnavailable }));
    };

    handleSelectionUpdate();

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  const handleColorHighlight = React.useCallback(() => {
    if (!editor || !canColorHighlightState || !highlightColor || !label) return false;

    if (editor.state.storedMarks) {
      const highlightMarkType = editor.schema.marks.highlight;
      if (highlightMarkType) {
        editor.view.dispatch(editor.state.tr.removeStoredMark(highlightMarkType));
      }
    }

    setTimeout(() => {
      const success = editor.chain().focus().toggleMark('highlight', { color: highlightColor.value }).run();
      if (success) {
        onApplied?.({ color: highlightColor.value, label });
      }
      return success;
    }, 0);
  }, [canColorHighlightState, highlightColor, editor, label, onApplied]);

  const handleRemoveHighlight = React.useCallback(() => {
    const success = removeHighlight(editor);
    if (success) {
      onApplied?.({ color: '', label: 'Remove highlight' });
    }
    return success;
  }, [editor, onApplied]);

  useHotkeys(
    COLOR_HIGHLIGHT_SHORTCUT_KEY,
    (event) => {
      event.preventDefault();
      handleColorHighlight();
    },
    {
      enabled: isVisible && canColorHighlightState,
      enableOnContentEditable: true,
      enableOnFormTags: true,
    }
  );

  return {
    isVisible,
    isActive,
    handleColorHighlight,
    handleRemoveHighlight,
    canColorHighlight: canColorHighlightState,
    label: label || `Highlight`,
    shortcutKeys: COLOR_HIGHLIGHT_SHORTCUT_KEY,
    Icon: LucideHighlighter,
  };
}
