import { useCallback, useEffect, useRef } from 'react';
import { checkEditorEmpty, normalizeContent, transformPastedToTextNormal } from '@/shared/utils';
import { createEditorExtensions } from '@/shared/utils/extensions';
import {
  useImageDragPaste,
  type EditorExtensions,
  type MentionConfig,
  type UseWhiteEditorReturn,
  type WhiteEditorProps,
} from '@/white-editor';
import { useEditor, useEditorState, type JSONContent, Editor } from '@tiptap/react';

export const useWhiteEditor = <T>(props: WhiteEditorProps<T>): UseWhiteEditorReturn => {
  const {
    extension,
    contentClassName,
    editorProps,
    placeholder,
    onChange,
    onUpdate,
    onBlur,
    onFocus,
    onEmptyChange,
    emptyCheckDebounceMs = 200,
    onCreate,
    onDestroy,
    onSelectionUpdate,
    addExtensions,
    customNodes,
    overrideExtensions,
    customNodeViews,
    content,
  } = props;

  const onEmptyChangeRef = useRef(onEmptyChange);
  onEmptyChangeRef.current = onEmptyChange;
  const emptyCheckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEmptyRef = useRef<boolean | null>(null);

  const notifyEmptyChange = useCallback((isEmpty: boolean) => {
    if (lastEmptyRef.current === isEmpty) return;
    lastEmptyRef.current = isEmpty;
    onEmptyChangeRef.current?.(isEmpty);
  }, []);

  const scheduleEmptyCheck = useCallback(
    (normalizedJSON: JSONContent) => {
      const isEmpty = checkEditorEmpty({ content: normalizedJSON });
      if (emptyCheckDebounceMs <= 0) {
        notifyEmptyChange(isEmpty);
        return;
      }
      if (emptyCheckTimerRef.current) clearTimeout(emptyCheckTimerRef.current);
      emptyCheckTimerRef.current = setTimeout(() => {
        emptyCheckTimerRef.current = null;
        notifyEmptyChange(isEmpty);
      }, emptyCheckDebounceMs);
    },
    [emptyCheckDebounceMs, notifyEmptyChange]
  );

  // for mention
  const mentionDataRef = useRef<MentionConfig<T>>(extension?.mention);
  useEffect(() => {
    mentionDataRef.current = extension?.mention;
  }, [extension?.mention]);

  // for pageMention
  const pageMentionConfigRef = useRef<EditorExtensions<T, Record<string, unknown>>['pageMention']>(
    extension?.pageMention
  );
  useEffect(() => {
    pageMentionConfigRef.current = extension?.pageMention;
  }, [extension?.pageMention]);

  const editorInstanceRef = useRef<Editor | null>(null);
  const { handleDrop, handlePaste } = useImageDragPaste(extension as EditorExtensions<Record<string, unknown>>);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    content,
    editorProps: {
      ...editorProps,
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        spellcheck: 'false',
        'aria-label': 'Editor Content',
        class: contentClassName || '',
        ...editorProps?.attributes,
      },
      handleKeyDown: (view, event) => {
        if (event.key === ' ') {
          return false;
        }
        return editorProps?.handleKeyDown?.(view, event) ?? false;
      },
      handleDrop: (view, event, slice, moved) => {
        if (handleDrop(view, event, slice, moved)) return true;
        return editorProps?.handleDrop?.(view, event, slice, moved) ?? false;
      },
      handlePaste: (view, event, slice) => {
        if (handlePaste(view, event)) return true;
        return editorProps?.handlePaste?.(view, event, slice) ?? false;
      },
      transformPasted: (slice, view, editor) => {
        const normalized = transformPastedToTextNormal(slice, view);
        return editorProps?.transformPasted?.(normalized, view, editor) ?? normalized;
      },
    },
    extensions: createEditorExtensions(
      mentionDataRef,
      pageMentionConfigRef,
      extension?.character?.limit,
      extension,
      placeholder,
      addExtensions,
      customNodes,
      overrideExtensions,
      customNodeViews
    ),
    onCreate: ({ editor: currentEditor }) => {
      editorInstanceRef.current = currentEditor;
      if (onEmptyChange) {
        const initialJSON = normalizeContent(currentEditor.getJSON());
        scheduleEmptyCheck(initialJSON);
      }
      onCreate?.(currentEditor);
    },
    onUpdate: ({ editor: currentEditor }) => {
      // 정규화된 JSONContent를 가져옴
      const originalJSON = currentEditor.getJSON();
      const normalizedJSON = normalizeContent(originalJSON);

      // 숫자가 문자열로 변환되었거나 빈 텍스트 노드가 제거된 경우, 에디터에 정규화된 content 설정
      const originalStr = JSON.stringify(originalJSON);
      const normalizedStr = JSON.stringify(normalizedJSON);

      if (originalStr !== normalizedStr) {
        // emitUpdate: false로 설정하여 무한 루프 방지
        currentEditor.commands.setContent(normalizedJSON, { emitUpdate: false });
      }

      if (onEmptyChange) {
        scheduleEmptyCheck(normalizedJSON);
      }
      onUpdate?.(normalizedJSON);
      onChange?.(normalizedJSON);
    },
    onBlur: ({ editor: currentEditor }) => {
      const normalizedJSON = normalizeContent(currentEditor.getJSON());
      onBlur?.(normalizedJSON);
    },
    onFocus: ({ editor: currentEditor }) => {
      const normalizedJSON = normalizeContent(currentEditor.getJSON());
      onFocus?.(normalizedJSON);
    },
    onDestroy: () => onDestroy?.(),
    onSelectionUpdate: ({ editor: currentEditor }) => onSelectionUpdate?.(currentEditor),
  });

  // Update editor instance ref when editor changes
  useEffect(() => {
    editorInstanceRef.current = editor;
  }, [editor]);

  // 디바운스 타이머 정리
  useEffect(() => {
    return () => {
      if (emptyCheckTimerRef.current) {
        clearTimeout(emptyCheckTimerRef.current);
        emptyCheckTimerRef.current = null;
      }
    };
  }, []);

  const editorState = useEditorState({
    editor,
    selector: (context) => ({
      charactersCount: context.editor?.storage.characterCount.characters(),
    }),
  });

  const charactersCount = editorState?.charactersCount || 0;

  const getHTML = useCallback(() => editor?.getHTML() || '', [editor]);
  const getJSON = useCallback((): JSONContent => {
    const json = editor?.getJSON() || {};
    return normalizeContent(json);
  }, [editor]);
  const getText = useCallback(() => editor?.getText() || '', [editor]);
  const setContent = useCallback(
    (content: string | JSONContent) => {
      if (typeof content === 'string') {
        editor?.commands.setContent(content);
      } else {
        // JSONContent인 경우 정규화하여 설정
        const normalizedContent = normalizeContent(content);
        editor?.commands.setContent(normalizedContent);
      }
    },
    [editor]
  );

  const focus = useCallback(() => editor?.commands.focus(), [editor]);
  const blur = useCallback(() => editor?.commands.blur(), [editor]);
  const clear = useCallback(() => editor?.commands.clearContent(true), [editor]);

  const isEmpty = editor ? checkEditorEmpty({ content: getJSON() }) : true;

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
