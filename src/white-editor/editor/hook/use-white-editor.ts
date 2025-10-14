import { useCallback, useEffect, useRef } from 'react';
import { createEditorExtensions } from '@/shared/utils';
import type { MentionConfig, UseWhiteEditorReturn, WhiteEditorProps } from '@/white-editor';
import { useEditor, useEditorState, type JSONContent, Editor } from '@tiptap/react';

export const useWhiteEditor = <T>(props: WhiteEditorProps<T>): UseWhiteEditorReturn => {
  const {
    extension,
    contentClassName,
    editorProps,
    onChange,
    onUpdate,
    onBlur,
    onFocus,
    onCreate,
    onDestroy,
    onSelectionUpdate,
  } = props;

  // for mention
  const mentionDataRef = useRef<MentionConfig<T>>(extension?.mention);
  useEffect(() => {
    mentionDataRef.current = extension?.mention;
  }, [extension?.mention]);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        spellcheck: 'false',
        'aria-label': 'Editor Content',
        class: contentClassName || '',
        ...(editorProps?.attributes || {}),
      },
      handleKeyDown: (view, event) => {
        if (event.key === ' ') {
          return false;
        }
        return editorProps?.handleKeyDown?.(view, event);
      },
      ...(editorProps || {}),
    },
    extensions: createEditorExtensions(mentionDataRef, extension?.character?.limit),
    onCreate: ({ editor: currentEditor }) => onCreate?.(currentEditor),
    onUpdate: ({ editor: currentEditor }) => {
      onUpdate?.(currentEditor);
      onChange?.(currentEditor as Editor);
    },
    onBlur: ({ editor: currentEditor }) => onBlur?.(currentEditor),
    onFocus: ({ editor: currentEditor }) => onFocus?.(currentEditor),
    onDestroy: () => onDestroy?.(),
    onSelectionUpdate: ({ editor: currentEditor }) => onSelectionUpdate?.(currentEditor),
  });

  const editorState = useEditorState({
    editor,
    selector: (context) => ({
      charactersCount: context.editor?.storage.characterCount.characters(),
    }),
  });

  const charactersCount = editorState?.charactersCount || 0;

  const getHTML = useCallback(() => editor?.getHTML() || '', [editor]);
  const getJSON = useCallback((): JSONContent => editor?.getJSON() || {}, [editor]);
  const getText = useCallback(() => editor?.getText() || '', [editor]);
  const setContent = useCallback(
    (content: string | JSONContent) => {
      editor?.commands.setContent(content);
    },
    [editor]
  );

  const focus = useCallback(() => editor?.commands.focus(), [editor]);
  const blur = useCallback(() => editor?.commands.blur(), [editor]);
  const clear = useCallback(() => editor?.commands.clearContent(true), [editor]);
  const isEmpty = editor?.isEmpty ?? true;

  return {
    editor,
    charactersCount,
    getHTML,
    getJSON,
    getText,
    setContent,
    focus,
    blur,
    isEmpty,
    clear,
  };
};
