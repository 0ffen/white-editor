import React from 'react';
import { useTiptapEditor } from '@/shared/hooks';
import { isNodeInSchema } from '@/shared/utils';
import type { MathematicsConfig, MathHandlerProps, MathType } from '@/white-editor';
import { type Editor } from '@tiptap/react';

export function canSetMath(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) {
    return false;
  }
  const canInsertBlock = editor.can().insertBlockMath({ latex: '' });
  const canInsertInline = editor.can().insertInlineMath({ latex: '' });
  const result = canInsertBlock || canInsertInline;
  return result;
}

const isMathActive = (editor: Editor | null, type?: MathType): boolean => {
  if (!editor || !editor.isEditable) return false;

  if (type === 'block') {
    return editor.isActive('blockMath');
  } else if (type === 'inline') {
    return editor.isActive('inlineMath');
  }

  return editor.isActive('inlineMath') || editor.isActive('blockMath');
};

const shouldShowMathButton = (props: MathematicsConfig): boolean => {
  const { editor, hideWhenUnavailable } = props;
  if (!editor) return false;
  const inlineMathInSchema = isNodeInSchema('inlineMath', editor);
  const blockMathInSchema = isNodeInSchema('blockMath', editor);

  if (!editor || !editor.isEditable) return false;
  if (!inlineMathInSchema || !blockMathInSchema) {
    return false;
  }
  if (hideWhenUnavailable && !editor.isActive('code') && !editor.isActive('image')) {
    const canSet = canSetMath(editor);
    return canSet;
  }
  return true;
};

//------ inline math ------
const onInsertInlineMath = (editor: Editor | null, latex = '') => {
  if (!editor) {
    return;
  }
  const hasSelection = !editor.state.selection.empty;
  if (hasSelection) {
    return editor.chain().insertInlineMath({ latex }).focus().run();
  }
  return editor.chain().insertInlineMath({ latex }).focus().run();
};

const onRemoveInlineMath = (editor: Editor | null) => {
  if (!editor) {
    return;
  }
  editor.chain().deleteInlineMath().focus().run();
};

const onUpdateInlineMath = (editor: Editor | null, latex: string) => {
  if (!editor) {
    return;
  }
  editor.chain().updateInlineMath({ latex }).focus().run();
};

//------ block math ------
const onInsertBlockMath = (editor: Editor | null, latex = '') => {
  if (!editor) {
    return;
  }
  const hasSelection = !editor.state.selection.empty;
  if (hasSelection) {
    return editor.chain().insertBlockMath({ latex }).focus().run();
  }
  return editor.chain().insertBlockMath({ latex }).focus().run();
};

const onRemoveBlockMath = (editor: Editor | null) => {
  if (!editor) {
    return;
  }
  editor.chain().deleteBlockMath().focus().run();
};

const onUpdateBlockMath = (editor: Editor | null, latex: string) => {
  if (!editor) {
    return;
  }
  editor.chain().updateBlockMath({ latex }).focus().run();
};

const useMathematicsHandler = (props: MathHandlerProps) => {
  const { editor, onSetMath, type } = props;
  const [mathString, setMathString] = React.useState<string>('');

  React.useEffect(() => {
    if (!editor) return;

    const updateMathState = () => {
      let currentLatex = '';

      if (type === 'block' && editor.isActive('blockMath')) {
        currentLatex = editor.getAttributes('blockMath').latex || '';
      } else if (type === 'inline' && editor.isActive('inlineMath')) {
        currentLatex = editor.getAttributes('inlineMath').latex || '';
      }
      setMathString(currentLatex);
    };

    updateMathState();
    editor.on('selectionUpdate', updateMathState);

    return () => {
      editor.off('selectionUpdate', updateMathState);
    };
  }, [editor, type]);

  const setMath = React.useCallback(
    (mathType?: MathType) => {
      if (!editor) return;

      const targetType = mathType || type;
      if (!targetType) return;

      const isBlockMathActive = editor.isActive('blockMath');
      const isInlineMathActive = editor.isActive('inlineMath');

      if (targetType === 'block') {
        if (isBlockMathActive) {
          onUpdateBlockMath(editor, mathString);
        } else {
          onInsertBlockMath(editor, mathString);
        }
      } else if (targetType === 'inline') {
        if (isInlineMathActive) {
          onUpdateInlineMath(editor, mathString);
        } else {
          onInsertInlineMath(editor, mathString);
        }
      }
      onSetMath?.();
    },
    [editor, mathString, onSetMath, type]
  );

  const removeMath = React.useCallback(() => {
    if (!editor) return;
    if (editor.isActive('blockMath')) {
      onRemoveBlockMath(editor);
    } else if (editor.isActive('inlineMath')) {
      onRemoveInlineMath(editor);
    }
    setMathString('');
  }, [editor]);

  return {
    mathString,
    setMathString,
    setMath,
    removeMath,
  };
};

const useMathematicsState = (props: Omit<MathematicsConfig, 'onSetMath'> & { type?: MathType }) => {
  const { editor, hideWhenUnavailable = false, type } = props;

  const [isVisible, setIsVisible] = React.useState(false);
  const [canSet, setCanSet] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);

  React.useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      setIsVisible(shouldShowMathButton({ editor, hideWhenUnavailable }));
      setCanSet(canSetMath(editor));
      setIsActive(isMathActive(editor, type));
    };

    handleUpdate();
    editor.on('selectionUpdate', handleUpdate);
    editor.on('transaction', handleUpdate);

    return () => {
      editor.off('selectionUpdate', handleUpdate);
      editor.off('transaction', handleUpdate);
    };
  }, [editor, hideWhenUnavailable, type]);

  return { isVisible, canSet, isActive };
};

const useMathematics = (config: MathematicsConfig & { type?: MathType }) => {
  const { editor: providedEditor, hideWhenUnavailable = false, onSetMath, type } = config;

  const { editor } = useTiptapEditor(providedEditor);

  const { isVisible, canSet, isActive } = useMathematicsState({
    editor,
    hideWhenUnavailable,
    type,
  });

  const mathHandler = useMathematicsHandler({
    editor,
    onSetMath,
    type,
  });

  return {
    isVisible,
    canSet,
    isActive,
    ...mathHandler,
    onInsertBlockMath: (latex?: string) => onInsertBlockMath(editor, latex),
    onRemoveBlockMath: () => onRemoveBlockMath(editor),
    onUpdateBlockMath: (latex: string) => onUpdateBlockMath(editor, latex),
    onInsertInlineMath: (latex?: string) => onInsertInlineMath(editor, latex),
    onRemoveInlineMath: () => onRemoveInlineMath(editor),
    onUpdateInlineMath: (latex: string) => onUpdateInlineMath(editor, latex),
  };
};

export { useMathematics };
