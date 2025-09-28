import * as React from 'react';
import { useTiptapEditor } from '@/shared/hooks';
import { isMarkInSchema, isNodeTypeSelected } from '@/shared/utils';
import { TEXT_COLORS, type ColorValue } from '@/white-editor';
import { type Editor } from '@tiptap/react';

export function pickTextColorsByValue(values: string[]) {
  const colorMap = new Map(TEXT_COLORS.map((color: ColorValue) => [color.value, color]));
  return values.map((value) => colorMap.get(value)).filter((color): color is (typeof TEXT_COLORS)[number] => !!color);
}

export function shouldShowColorPickerButton(props: { editor: Editor | null; hideWhenUnavailable: boolean }): boolean {
  const { editor } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isMarkInSchema('textStyle', editor)) return false;

  return true;
}

export function canTextColor(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isMarkInSchema('textStyle', editor) || isNodeTypeSelected(editor, ['image'])) return false;

  return editor.can().setMark('textStyle');
}

export function isTextColorActive(editor: Editor | null, textColor?: string): boolean {
  if (!editor || !editor.isEditable) return false;
  return textColor ? editor.isActive('textStyle', { color: textColor }) : editor.isActive('textStyle');
}

export function removeTextColor(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canTextColor(editor)) return false;

  return editor.chain().focus().unsetMark('textStyle').run();
}

export function useTextColor(config: {
  editor?: Editor | null;
  textColor?: ColorValue;
  label?: string;
  hideWhenUnavailable?: boolean;
  onApplied?: ({ color, label }: { color: string; label: string }) => void;
}) {
  const { editor: providedEditor, label, textColor, hideWhenUnavailable = false, onApplied } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = React.useState<boolean>(true);
  const canTextColorState = canTextColor(editor);
  const isActive = isTextColorActive(editor, textColor?.value);

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowColorPickerButton({ editor, hideWhenUnavailable }));
    };

    handleSelectionUpdate();

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  const handleTextColor = React.useCallback(() => {
    if (!editor || !canTextColorState || !textColor || !label) return false;

    if (editor.state.storedMarks) {
      const textStyleMarkType = editor.schema.marks.textStyle;
      if (textStyleMarkType) {
        editor.view.dispatch(editor.state.tr.removeStoredMark(textStyleMarkType));
      }
    }

    setTimeout(() => {
      const success = editor.chain().focus().setColor(textColor.value).run();
      if (success) {
        onApplied?.({ color: textColor.value, label });
      }
      return success;
    }, 0);
  }, [canTextColorState, textColor, editor, label, onApplied]);

  const handleRemoveTextColor = React.useCallback(() => {
    const success = removeTextColor(editor);
    if (success) {
      onApplied?.({ color: '', label: 'Remove text color' });
    }
    return success;
  }, [editor, onApplied]);

  return {
    isVisible,
    isActive,
    handleTextColor,
    handleRemoveTextColor,
    canTextColor: canTextColorState,
    label: label || `Text Color`,
  };
}
