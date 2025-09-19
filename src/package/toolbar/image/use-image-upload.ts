import * as React from 'react';
import { ImagePlusIcon } from 'lucide-react';
import { useTiptapEditor } from '@/hooks';
import { isExtensionAvailable, isNodeTypeSelected } from '@/utils';
import { type Editor } from '@tiptap/react';

export interface UseImageUploadConfig {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
  onInserted?: () => void;
}

export function canInsertImage(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isExtensionAvailable(editor, 'imageUpload') || isNodeTypeSelected(editor, ['image'])) return false;

  return editor.can().insertContent({ type: 'imageUpload' });
}

export function isImageActive(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  return editor.isActive('imageUpload');
}

export function insertImage(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canInsertImage(editor)) return false;

  try {
    return editor
      .chain()
      .focus()
      .insertContent({
        type: 'imageUpload',
      })
      .run();
  } catch {
    return false;
  }
}

export function shouldShowImageUploadButton(props: { editor: Editor | null; hideWhenUnavailable: boolean }): boolean {
  const { editor, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isExtensionAvailable(editor, 'imageUpload')) return false;

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canInsertImage(editor);
  }

  return true;
}

/**
 * Custom hook that provides image functionality for Tiptap editor
 *
 * @example
 * ```tsx
 * // Simple usage - no params needed
 * function MySimpleImageButton() {
 *   const { isVisible, handleImage } = useImage()
 *
 *   if (!isVisible) return null
 *
 *   return <button onClick={handleImage}>Add Image</button>
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedImageButton() {
 *   const { isVisible, handleImage, label, isActive } = useImage({
 *     editor: myEditor,
 *     hideWhenUnavailable: true,
 *     onInserted: () => console.log('Image inserted!')
 *   })
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <MyButton
 *       onClick={handleImage}
 *       aria-pressed={isActive}
 *       aria-label={label}
 *     >
 *       Add Image
 *     </MyButton>
 *   )
 * }
 * ```
 */
export function useImageUpload(config?: UseImageUploadConfig) {
  const { editor: providedEditor, hideWhenUnavailable = false, onInserted } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = React.useState<boolean>(true);
  const canInsert = canInsertImage(editor);
  const isActive = isImageActive(editor);

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowImageUploadButton({ editor, hideWhenUnavailable }));
    };

    handleSelectionUpdate();

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  const handleImage = React.useCallback(() => {
    if (!editor) return false;

    const success = insertImage(editor);
    if (success) {
      onInserted?.();
    }
    return success;
  }, [editor, onInserted]);

  return {
    isVisible,
    isActive,
    handleImage,
    canInsert,
    label: '이미지 업로드',
    Icon: ImagePlusIcon,
  };
}
