import { useCallback } from 'react';
import type { EditorView } from '@tiptap/pm/view';
import type { EditorExtensions } from '../../../editor/type/white-editor.type';

export const useImageDragPaste = (extension: EditorExtensions<Record<string, unknown>> | undefined) => {
  const handleUpload = useCallback(
    async (file: File, view?: EditorView) => {
      const uploadFn = extension?.imageUpload?.upload;

      if (!uploadFn) {
        return;
      }

      try {
        const imageUrl = await uploadFn(file);
        if (!imageUrl) {
          return;
        }

        if (view) {
          const { state, dispatch } = view;
          const { schema } = state;
          if (!schema.nodes.image) {
            return;
          }
          const node = schema.nodes.image.create({ src: imageUrl });
          const transaction = state.tr.replaceSelectionWith(node, false);
          dispatch(transaction);
        }
      } catch (error) {
        extension?.imageUpload?.onError?.(error instanceof Error ? error : new Error('Failed to upload image'));
      }
    },
    [extension?.imageUpload]
  );

  // 붙여넣기 이벤트 핸들링
  const handlePaste = useCallback(
    (view: EditorView, event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return false;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && item.type.indexOf('image') !== -1) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) handleUpload(file, view);
          return true;
        }
      }
      return false;
    },
    [handleUpload]
  );

  // 드래그 앤 드롭 이벤트 핸들링
  const handleDrop = useCallback(
    (view: EditorView, event: DragEvent, _slice: unknown, moved: boolean) => {
      if (moved) return false; // 에디터 내 이동은 기본 동작 허용

      const files = event.dataTransfer?.files;
      if (!files || files.length === 0) return false;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file && file.type.startsWith('image/')) {
          event.preventDefault();
          handleUpload(file, view);
          return true;
        }
      }

      return false;
    },
    [handleUpload]
  );

  return {
    handlePaste,
    handleDrop,
  };
};
