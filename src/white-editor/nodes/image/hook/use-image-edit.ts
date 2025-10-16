import { useCallback, useState } from 'react';

import type { Editor } from '@tiptap/react';

export interface ImageEditContext {
  src: string;
  caption?: string;
  nodePos: number;
}

export interface UseImageEditOptions {
  editor?: Editor;
  upload?: (file: File) => Promise<string>;
}

export function useImageEdit(options: UseImageEditOptions = {}) {
  const { editor, upload } = options;
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
    async (newImageFile: File, newCaption: string) => {
      if (!editingImage || !editor) return;

      try {
        let uploadedUrl = '';

        // upload 콜백이 제공되면 서버에 업로드
        if (upload) {
          uploadedUrl = await upload(newImageFile);
        } else {
          // 콜백이 없으면 로컬 URL 사용 (개발용)
          uploadedUrl = URL.createObjectURL(newImageFile);
          // eslint-disable-next-line no-console
          console.warn('Image upload callback not provided. Using local URL for development.');
        }

        // 서버에서 받은 URL로 에디터 노드 업데이트
        const transaction = editor.state.tr;
        const node = editor.state.doc.nodeAt(editingImage.nodePos);

        if (node && node.type.name === 'image') {
          const newAttrs = {
            ...node.attrs,
            src: uploadedUrl,
            caption: newCaption,
          };

          transaction.setNodeMarkup(editingImage.nodePos, undefined, newAttrs);
          editor.view.dispatch(transaction);
        }

        closeImageEdit();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to update image:', error);
      }
    },
    [editingImage, editor, closeImageEdit, upload]
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
