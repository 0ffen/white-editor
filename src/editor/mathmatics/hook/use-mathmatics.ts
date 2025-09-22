// @tiptap/extension-mathematics

import React from 'react';
import { isMarkInSchema } from '@/utils';
import type { Editor } from '@tiptap/react';

interface MathmaticsProps {
  editor: Editor | null;
  hideWhenUnavailable?: boolean;
  onSetMath?: () => void;
}

export interface MathHandlerProps {
  editor: Editor | null;
  onSetMath?: () => void;
}

export function canSetMath(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  return editor.can().setMark('math');
}

export function isMathActive(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  return editor.isActive('math');
}

export function shouldShowMathButton(props: { editor: Editor | null; hideWhenUnavailable: boolean }): boolean {
  const { editor, hideWhenUnavailable } = props;

  const mathInSchema = isMarkInSchema('math', editor);

  if (!mathInSchema || !editor) {
    return false;
  }

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canSetMath(editor);
  }

  return true;
}

const toggleEditingMath = (e: React.ChangeEvent<HTMLInputElement>, editor: Editor | null) => {
  if (!editor) {
    return;
  }
  const { checked } = e.target;
  editor.setEditable(!checked, true);
  editor.view.dispatch(editor.view.state.tr.scrollIntoView());
};

const onInsertInlineMath = (editor: Editor | null) => {
  if (!editor) {
    return;
  }

  const hasSelection = !editor.state.selection.empty;

  if (hasSelection) {
    return editor.chain().insertInlineMath({ latex: '' }).focus().run();
  }

  const latex = 'Enter inline math expression:';
  return editor.chain().insertInlineMath({ latex }).focus().run();
};

const onRemoveInlineMath = (editor: Editor | null) => {
  if (!editor) {
    return;
  }
  editor.chain().deleteInlineMath().focus().run();
};

const onInsertBlockMath = (editor: Editor | null) => {
  if (!editor) {
    return;
  }

  const hasSelection = !editor.state.selection.empty;

  if (hasSelection) {
    return editor.chain().insertBlockMath({ latex: '' }).focus().run();
  }

  const latex = '';
  return editor.chain().insertBlockMath({ latex }).focus().run();
};

const onRemoveBlockMath = (editor: Editor | null) => {
  if (!editor) {
    return;
  }
  editor.chain().deleteBlockMath().focus().run();
};

const onUpdateInlineMath = (editor: Editor | null, latex: string) => {
  if (!editor) {
    return;
  }
  editor.chain().updateInlineMath({ latex }).focus().run();
};

const onUpdateBlockMath = (editor: Editor | null, latex: string) => {
  if (!editor) {
    return;
  }
  editor.chain().updateBlockMath({ latex }).focus().run();
};

// Math.configure에서 사용할 핸들러 함수들
export const createMathClickHandlers = (
  onOpenInlineMathPopover?: (latex: string, pos?: number) => void,
  onOpenBlockMathPopover?: (latex: string, pos?: number) => void
) => ({
  blockOptions: {
    onClick: (node: { attrs: { latex: string } }, pos: number) => {
      if (onOpenBlockMathPopover) {
        onOpenBlockMathPopover(node.attrs.latex, pos);
      }
    },
  },
  inlineOptions: {
    onClick: (node: { attrs: { latex: string }; pos?: number }, pos?: number) => {
      if (onOpenInlineMathPopover) {
        onOpenInlineMathPopover(node.attrs.latex, pos);
      }
    },
  },
});

export function useMathHandler(props: MathHandlerProps) {
  const { editor } = props;
  const [mathInput, setMathInput] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!editor) return;

    const { latex } = editor.getAttributes('math');

    if (isMathActive(editor) && mathInput === null) {
      setMathInput(latex || '');
    }
  }, [editor, mathInput]);

  React.useEffect(() => {
    if (!editor) return;

    const updateMathInput = () => {
      const { latex } = editor.getAttributes('math');
      setMathInput(latex || '');
    };

    editor.on('selectionUpdate', updateMathInput);
    return () => {
      editor.off('selectionUpdate', updateMathInput);
    };
  }, [editor]);

  return { mathInput, setMathInput };
}

export const useMathmatics = (props: MathmaticsProps) => {
  const { editor, onSetMath, hideWhenUnavailable = false } = props;

  const isActive = isMathActive(editor);

  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(
        shouldShowMathButton({
          editor,
          hideWhenUnavailable,
        })
      );
    };

    handleSelectionUpdate();

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  return {
    isActive,
    isVisible,
    onSetMath,
  };
};

export {
  toggleEditingMath,
  onInsertBlockMath,
  onRemoveBlockMath,
  onInsertInlineMath,
  onRemoveInlineMath,
  onUpdateInlineMath,
  onUpdateBlockMath,
};
