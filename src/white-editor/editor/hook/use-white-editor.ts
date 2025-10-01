import { createListConfig, createEditorExtensions, migrateMathStrings } from '@/shared/utils';
import type { WhiteEditorProps } from '@/white-editor';
import { useEditor, useEditorState } from '@tiptap/react';

export const useWhiteEditor = <T>(props: WhiteEditorProps<T>) => {
  const {
    extension,
    contentClassName,
    onChange,
    editorProps,
    onUpdate,
    onBlur,
    onFocus,
    onCreate,
    onDestroy,
    onSelectionUpdate,
  } = props;

  // for mention
  const mentionItems = extension?.mention?.data
    ? createListConfig(extension.mention.data, {
        id: extension.mention.id,
        label: extension.mention.label,
      })
    : undefined;

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        'aria-label': 'Editor Content',
        class: contentClassName || '',
        ...(editorProps?.attributes || {}),
      },
      handleKeyDown: (view, event) => {
        // 스페이스바 키 이벤트 처리
        if (event.key === ' ') {
          //불필요한 paragraph 생성 방지
          return false;
        }
        return editorProps?.handleKeyDown?.(view, event);
      },
      ...(editorProps || {}),
    },
    extensions: createEditorExtensions(mentionItems, extension?.character?.limit),
    onCreate: ({ editor: currentEditor }) => {
      migrateMathStrings(currentEditor);
      onCreate?.(currentEditor);
    },
    onUpdate: ({ editor: currentEditor }) => {
      const jsonContent = currentEditor.getJSON();
      onUpdate?.(jsonContent);
      onChange?.(jsonContent);
    },
    onBlur: ({ editor: currentEditor }) => {
      onBlur?.(currentEditor.getJSON());
    },
    onFocus: ({ editor: currentEditor }) => {
      onFocus?.(currentEditor.getJSON());
    },
    onDestroy: () => {
      onDestroy?.();
    },
    onSelectionUpdate: ({ editor: currentEditor }) => {
      onSelectionUpdate?.(currentEditor);
    },
  });

  const editorState = useEditorState({
    editor,
    selector: (context) => ({
      charactersCount: context.editor?.storage.characterCount.characters(),
    }),
  });

  const charactersCount = editorState?.charactersCount || 0;

  return { editor, charactersCount };
};
