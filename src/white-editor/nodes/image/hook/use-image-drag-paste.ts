import { useCallback, useRef } from 'react';
import type { EditorView } from '@tiptap/pm/view';
import type { EditorExtensions } from '../../../editor/type/white-editor.type';

function findImagePosByUploadId(view: EditorView, uploadId: string): number | null {
  let pos: number | null = null;
  view.state.doc.descendants((node, p) => {
    if (node.type.name === 'image' && node.attrs.uploadId === uploadId) {
      pos = p;
      return false;
    }
  });
  return pos;
}

function updateImageAttrsByUploadId(view: EditorView, uploadId: string, attrs: Record<string, unknown>): void {
  const pos = findImagePosByUploadId(view, uploadId);
  if (pos == null) return;
  const node = view.state.doc.nodeAt(pos);
  if (!node) return;
  const tr = view.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...attrs });
  view.dispatch(tr);
}

export const useImageDragPaste = (extension: EditorExtensions<Record<string, unknown>> | undefined) => {
  // ref를 사용하여 항상 최신 extension 값을 참조 (stale closure 방지)
  const extensionRef = useRef(extension);
  extensionRef.current = extension;

  const runUploadInBackground = useCallback((view: EditorView, file: File, uploadId: string, blobUrl: string) => {
    const uploadFn = extensionRef.current?.imageUpload?.upload;
    if (!uploadFn) return;

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 10;
      if (currentProgress <= 90) {
        updateImageAttrsByUploadId(view, uploadId, { uploadingProgress: currentProgress });
      }
    }, 100);

    const execute = async () => {
      try {
        const url = await uploadFn(file);
        clearInterval(progressInterval);

        if (url) {
          updateImageAttrsByUploadId(view, uploadId, {
            src: url,
            uploadingProgress: null,
            uploadId: null,
            uploadError: false,
            uploadErrorFileName: undefined,
          });
          extensionRef.current?.imageUpload?.onSuccess?.(url);
          extensionRef.current?.imageUpload?.onImageInserted?.(url, '');
        }
      } catch (error) {
        clearInterval(progressInterval);
        updateImageAttrsByUploadId(view, uploadId, {
          uploadError: true,
          uploadingProgress: null,
          uploadId: null,
          uploadErrorFileName: file.name,
        });
        extensionRef.current?.imageUpload?.onError?.(
          error instanceof Error ? error : new Error('Failed to upload image')
        );
      } finally {
        URL.revokeObjectURL(blobUrl);
      }
    };

    void execute();
  }, []);

  const insertAndUploadImages = useCallback(
    (files: File[], view: EditorView, insertPos?: number) => {
      const { schema } = view.state;
      if (!schema.nodes.image) return;

      const ext = extensionRef.current;
      const maxSize = ext?.imageUpload?.maxSize;
      const uploadItems: { file: File; uploadId: string; blobUrl: string }[] = [];

      const tr = view.state.tr;

      for (const file of files) {
        if (maxSize && file.size > maxSize) {
          ext?.imageUpload?.onError?.(new Error(`파일 크기는 ${maxSize / 1024 / 1024}MB 이하여야 합니다.`));
          continue;
        }

        const uploadId = crypto.randomUUID();
        const blobUrl = URL.createObjectURL(file);
        const node = schema.nodes.image.create({
          src: blobUrl,
          alt: 'Image',
          caption: '',
          width: '500px',
          height: 'auto',
          uploadId,
          uploadingProgress: 0,
        });

        if (insertPos != null) {
          const mappedPos = tr.mapping.map(insertPos);
          tr.replaceRangeWith(mappedPos, mappedPos, node);
        } else {
          tr.replaceSelectionWith(node, false);
        }

        uploadItems.push({ file, uploadId, blobUrl });
      }

      if (uploadItems.length === 0) return;

      view.dispatch(tr);

      for (const item of uploadItems) {
        runUploadInBackground(view, item.file, item.uploadId, item.blobUrl);
      }
    },
    [runUploadInBackground]
  );

  // 붙여넣기 이벤트 핸들링
  const handlePaste = useCallback(
    (view: EditorView, event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return false;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }

      if (imageFiles.length === 0) return false;

      // 이미지 파일이 있으면 항상 기본 동작 차단
      event.preventDefault();

      if (extensionRef.current?.imageUpload?.upload) {
        insertAndUploadImages(imageFiles, view);
      }

      return true;
    },
    [insertAndUploadImages]
  );

  // 드래그 앤 드롭 이벤트 핸들링
  const handleDrop = useCallback(
    (view: EditorView, event: DragEvent, _slice: unknown, moved: boolean) => {
      if (moved) return false;

      const files = event.dataTransfer?.files;
      if (!files || files.length === 0) return false;

      const imageFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file && file.type.startsWith('image/')) {
          imageFiles.push(file);
        }
      }

      if (imageFiles.length === 0) return false;

      // 이미지 파일이 있으면 항상 기본 동작 차단 (새 탭 열림 방지)
      event.preventDefault();

      if (extensionRef.current?.imageUpload?.upload) {
        const dropCoords = view.posAtCoords({ left: event.clientX, top: event.clientY });
        const insertPos = dropCoords?.pos;
        insertAndUploadImages(imageFiles, view, insertPos);
      }

      return true;
    },
    [insertAndUploadImages]
  );

  return {
    handlePaste,
    handleDrop,
  };
};
