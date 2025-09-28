import { createListConfig } from '@/shared/utils';
import { createEditorExtensions, migrateMathStrings } from '@/shared/utils/extensions';
import { useEditor } from '@tiptap/react';
import type { WhiteEditorProps } from '../type/white-editor.type';

export const useWhiteEditor = <T>(props: WhiteEditorProps<T>) => {
  const { extension, contentClassName, onChange, onUpdate, onBlur, onFocus, onCreate, onDestroy, onSelectionUpdate } =
    props;

  // for mention
  const mentionItems = extension?.mention
    ? createListConfig(extension.mention.listData, {
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
      },
    },
    extensions: createEditorExtensions(mentionItems),
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

  return { editor };
};
