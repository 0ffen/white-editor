import { useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { EditorView } from '@tiptap/pm/view';
import {
  addImageUploadPlaceholder,
  completeImageUploadPlaceholder,
  setImageUploadPlaceholderError,
  updateImageUploadPlaceholderProgress,
} from '../extension/image-upload-placeholder';
import type { EditorExtensions } from '../../../editor/type/white-editor.type';

export const useImageDragPaste = (extension: EditorExtensions<Record<string, unknown>> | undefined) => {
  // ref를 사용하여 항상 최신 extension 값을 참조 (stale closure 방지)
  const extensionRef = useRef(extension);
  extensionRef.current = extension;

  const runUploadInBackground = useCallback((view: EditorView, file: File, uploadId: string, previewUrl: string) => {
    const uploadFn = extensionRef.current?.imageUpload?.upload;
    if (!uploadFn) return;

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 10;
      if (currentProgress <= 90) {
        // 진행률은 decoration DOM에서만 갱신 (트랜잭션/문서 변경 없음)
        updateImageUploadPlaceholderProgress(view, uploadId, currentProgress);
      }
    }, 100);

    const execute = async () => {
      try {
        const url = await uploadFn(file);
        clearInterval(progressInterval);

        if (url) {
          const inserted = completeImageUploadPlaceholder(view, uploadId, { src: url });
          if (inserted) {
            extensionRef.current?.imageUpload?.onSuccess?.(url);
            extensionRef.current?.imageUpload?.onImageInserted?.(url, '');
          }
        } else {
          setImageUploadPlaceholderError(view, uploadId, file.name);
        }
      } catch (error) {
        clearInterval(progressInterval);
        setImageUploadPlaceholderError(view, uploadId, file.name);
        extensionRef.current?.imageUpload?.onError?.(
          error instanceof Error ? error : new Error('Failed to upload image')
        );
      } finally {
        URL.revokeObjectURL(previewUrl);
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
      const uploadItems: { file: File; uploadId: string; previewUrl: string }[] = [];

      // 업로드 중에는 공유 문서에 노드를 넣지 않고 로컬 전용 placeholder decoration만 표시.
      // 실제 이미지 노드는 업로드 완료 후 최종 URL로 1회만 삽입된다. (협업 환경 대응)
      const pos = insertPos ?? view.state.selection.from;

      for (const file of files) {
        if (maxSize && file.size > maxSize) {
          ext?.imageUpload?.onError?.(new Error(`파일 크기는 ${maxSize / 1024 / 1024}MB 이하여야 합니다.`));
          continue;
        }

        const uploadId = uuidv4();
        const previewUrl = URL.createObjectURL(file);
        addImageUploadPlaceholder(view, { id: uploadId, pos, previewUrl, fileName: file.name });
        uploadItems.push({ file, uploadId, previewUrl });
      }

      for (const item of uploadItems) {
        runUploadInBackground(view, item.file, item.uploadId, item.previewUrl);
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
