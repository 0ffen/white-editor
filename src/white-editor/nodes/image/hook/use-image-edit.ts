import { useCallback, useState } from 'react';

import type { Editor } from '@tiptap/react';

export interface ImageEditContext {
  src: string;
  caption?: string;
  nodePos: number;
}

export interface UseImageEditOptions {
  editor?: Editor;
}

export function useImageEdit(options: UseImageEditOptions = {}) {
  const { editor } = options;
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
    async (newImageUrl: string, newCaption: string) => {
      if (!editingImage || !editor) return;

      try {
        const transaction = editor.state.tr;
        const node = editor.state.doc.nodeAt(editingImage.nodePos);

        if (node && node.type.name === 'image') {
          const newAttrs = {
            ...node.attrs,
            src: newImageUrl,
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
    [editingImage, editor, closeImageEdit]
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
