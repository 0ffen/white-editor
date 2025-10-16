import { useCallback, useEffect, useRef } from 'react';
import { createEditorExtensions, handleImageUpload } from '@/shared/utils';
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

  // Handle image drop and paste
  const handleImageFiles = useCallback(
    async (files: File[], editor: Editor, pos?: number) => {
      const imageFiles = files.filter((file) => file.type.startsWith('image/'));

      if (imageFiles.length === 0) return false;

      const uploadFn = extension?.imageUpload?.upload || handleImageUpload;
      const onError = extension?.imageUpload?.onError;
      const onSuccess = extension?.imageUpload?.onSuccess;

      for (const file of imageFiles) {
        try {
          const url = await uploadFn(file);

          if (url) {
            // Insert image at the drop position or current cursor position
            if (pos !== undefined) {
              editor
                .chain()
                .focus()
                .insertContentAt(pos, {
                  type: 'image',
                  attrs: { src: url },
                })
                .run();
            } else {
              editor.chain().focus().setResizableImage({ src: url }).run();
            }
            onSuccess?.(url);
          }
        } catch (error) {
          onError?.(error instanceof Error ? error : new Error('Failed to upload image'));
        }
      }

      return true;
    },
    [extension?.imageUpload]
  );

  const editorInstanceRef = useRef<Editor | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      ...editorProps,
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
        return editorProps?.handleKeyDown?.(view, event) ?? false;
      },
      handleDrop: (view, event, slice, moved) => {
        // Call custom handleDrop if provided
        const customResult = editorProps?.handleDrop?.(view, event, slice, moved);
        if (customResult) {
          return customResult;
        }

        // Handle image files dropped
        if (!moved && event.dataTransfer?.files?.length && editorInstanceRef.current) {
          const files = Array.from(event.dataTransfer.files);
          const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;

          if (files.some((file) => file.type.startsWith('image/'))) {
            event.preventDefault();
            handleImageFiles(files, editorInstanceRef.current, pos);
            return true;
          }
        }

        return false;
      },
      handlePaste: (view, event, slice) => {
        // Call custom handlePaste if provided
        const customResult = editorProps?.handlePaste?.(view, event, slice);
        if (customResult) {
          return customResult;
        }

        // Handle pasted image files
        const files = event.clipboardData?.files;
        if (files && files.length > 0 && editorInstanceRef.current) {
          const fileArray = Array.from(files);
          if (fileArray.some((file) => file.type.startsWith('image/'))) {
            event.preventDefault();
            handleImageFiles(fileArray, editorInstanceRef.current);
            return true;
          }
        }

        return false;
      },
    },
    extensions: createEditorExtensions(mentionDataRef, extension?.character?.limit),
    onCreate: ({ editor: currentEditor }) => {
      editorInstanceRef.current = currentEditor;
      onCreate?.(currentEditor);
    },
    onUpdate: ({ editor: currentEditor }) => {
      onUpdate?.(currentEditor);
      onChange?.(currentEditor as Editor);
    },
    onBlur: ({ editor: currentEditor }) => onBlur?.(currentEditor),
    onFocus: ({ editor: currentEditor }) => onFocus?.(currentEditor),
    onDestroy: () => onDestroy?.(),
    onSelectionUpdate: ({ editor: currentEditor }) => onSelectionUpdate?.(currentEditor),
  });

  // Update editor instance ref when editor changes
  useEffect(() => {
    editorInstanceRef.current = editor;
  }, [editor]);

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
