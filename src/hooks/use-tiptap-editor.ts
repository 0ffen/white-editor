import * as React from 'react';
import type { Editor } from '@tiptap/react';
import { useCurrentEditor, useEditorState } from '@tiptap/react';

/**
 * @name useTiptapEditor
 * @description Tiptap 에디터 인스턴스에 접근할 수 있는 훅
 *
 * 선택적으로 에디터 인스턴스를 직접 전달하거나, Tiptap 컨텍스트에서 에디터를 가져올 수 있습니다.
 * 이를 통해 컴포넌트가 에디터를 직접 전달받거나, Tiptap 에디터 컨텍스트 내에서 모두 동작할 수 있습니다.
 *
 * @param providedEditor - 컨텍스트 에디터 대신 사용할 선택적 에디터 인스턴스
 * @returns 전달된 에디터 또는 컨텍스트에서 가져온 에디터 중 사용 가능한 인스턴스
 */
export function useTiptapEditor(providedEditor?: Editor | null): {
  editor: Editor | null;
  editorState?: Editor['state'];
  canCommand?: Editor['can'];
} {
  const { editor: coreEditor } = useCurrentEditor();
  const mainEditor = React.useMemo(() => providedEditor || coreEditor, [providedEditor, coreEditor]);

  const editorState = useEditorState({
    editor: mainEditor,
    selector(context) {
      if (!context.editor) {
        return {
          editor: null,
          editorState: undefined,
          canCommand: undefined,
        };
      }

      return {
        editor: context.editor,
        editorState: context.editor.state,
        canCommand: context.editor.can,
      };
    },
  });

  return editorState || { editor: null };
}
