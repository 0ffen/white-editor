import { useCallback, useState } from 'react';

import type { Editor } from '@tiptap/react';
import type { EditorExtensions } from '../../../editor/type/white-editor.type';

export interface ImageEditContext {
  src: string;
  caption?: string;
  nodePos: number;
}

export interface UseImageEditOptions {
  editor?: Editor;
  extension?: EditorExtensions<Record<string, unknown>>;
}

export function useImageEdit(options: UseImageEditOptions = {}) {
  const { editor, extension } = options;
  const [editingImage, setEditingImage] = useState<ImageEditContext | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openImageEdit = useCallback((context: ImageEditContext) => {
    setEditingImage(context);
    setIsDialogOpen(true);
  }, []);

  const closeImageEdit = useCallback(() => {
    setEditingImage(null);
    setIsDialogOpen(false);
  }, []);

  const handleImageSave = useCallback(
    async (newImageFile: File) => {
      if (!editingImage || !editor) return;

      try {
        let uploadedUrl = '';

        // extension의 upload 함수가 제공되면 서버에 업로드
        const uploadFn = extension?.imageUpload?.upload;
        if (uploadFn) {
          uploadedUrl = await uploadFn(newImageFile);
          extension?.imageUpload?.onSuccess?.(uploadedUrl);
        } else {
          // extension의 upload 함수가 없으면 로컬 URL 사용 (개발용)
          uploadedUrl = URL.createObjectURL(newImageFile);
          // eslint-disable-next-line no-console
          console.warn('Image upload callback not provided. Using local URL for development.');
        }

        // 서버에서 받은 URL로 에디터 노드 업데이트 (캡션은 플로팅 캡션 버튼으로만 수정)
        const transaction = editor.state.tr;
        const node = editor.state.doc.nodeAt(editingImage.nodePos);

        if (node && node.type.name === 'image') {
          const newAttrs = {
            ...node.attrs,
            src: uploadedUrl,
            caption: editingImage.caption ?? node.attrs.caption ?? '',
          };

          transaction.setNodeMarkup(editingImage.nodePos, undefined, newAttrs);
          editor.view.dispatch(transaction);
        }

        closeImageEdit();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to update image:', error);
        extension?.imageUpload?.onError?.(error instanceof Error ? error : new Error('Failed to upload image'));
      }
    },
    [editingImage, editor, closeImageEdit, extension]
  );

  return {
    editingImage,
    isDialogOpen,
    openImageEdit,
    closeImageEdit,
    handleImageSave,
    setIsDialogOpen,
  };
}
