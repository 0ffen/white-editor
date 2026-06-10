// 직접 경로 사용 — `@/white-editor` barrel은 editor/toolbar 까지 끌어와 viewer 청크 분리를 깨뜨림.
import { ImageNodeView } from '@/white-editor/nodes/image/ui/node/image-node-view';
import Image from '@tiptap/extension-image';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { imageUploadPlaceholderPlugin } from './image-upload-placeholder';
import type { EditorExtensions } from '../../../editor/type/white-editor.type';

export interface ResizableImageOptions {
  extension?: EditorExtensions<Record<string, unknown>> | null;
}

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    resizableImage: {
      setResizableImage: (options: {
        src: string;
        alt?: string;
        title?: string;
        caption?: string;
        width?: string;
        height?: string;
        textAlign?: string;
        /** 인라인 업로드 시 진행률 표시용 (HTML에 저장하지 않음) */
        uploadId?: string | null;
        uploadingProgress?: number | null;
      }) => ReturnType;
      /**
       * uploadId에 해당하는 이미지 노드의 업로드 상태 업데이트
       * @deprecated 업로드 임시 상태를 노드 attr에 넣는 방식은 협업(Yjs) 환경에서
       * 다른 피어에게 동기화되는 문제가 있어 decoration 기반 placeholder
       * (`image-upload-placeholder.ts`)로 대체됨. 하위 호환을 위해서만 유지.
       */
      updateImageUploadState: (
        uploadId: string,
        state: { progress?: number | null; src?: string; uploadError?: boolean; uploadErrorFileName?: string }
      ) => ReturnType;
    };
  }
}

export const ResizableImage = Image.extend<ResizableImageOptions>({
  name: 'image',

  draggable: true,

  addOptions() {
    return {
      ...this.parent?.(),
      extension: null as EditorExtensions<Record<string, unknown>> | null,
    };
  },

  addStorage() {
    return {
      extension: null as EditorExtensions<Record<string, unknown>> | null,
    };
  },

  onCreate() {
    this.storage.extension = this.options.extension || null;
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('src'),
        renderHTML: (attributes: { src?: string }) => {
          if (!attributes.src) {
            return {};
          }
          return { src: attributes.src };
        },
      },
      alt: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('alt'),
        renderHTML: (attributes: { alt?: string }) => {
          if (!attributes.alt) {
            return {};
          }
          return { alt: attributes.alt };
        },
      },
      title: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('title'),
        renderHTML: (attributes: { title?: string }) => {
          if (!attributes.title) {
            return {};
          }
          return { title: attributes.title };
        },
      },
      width: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('width'),
        renderHTML: (attributes: { width?: string }) => {
          if (!attributes.width) {
            return {};
          }
          return { width: attributes.width };
        },
      },
      height: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('height'),
        renderHTML: (attributes: { height?: string }) => {
          if (!attributes.height) {
            return {};
          }
          return { height: attributes.height };
        },
      },
      caption: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-caption'),
        renderHTML: (attributes: { caption?: string }) => {
          if (!attributes.caption) {
            return {};
          }
          return { 'data-caption': attributes.caption };
        },
      },
      textAlign: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.textAlign || null,
        renderHTML: (attributes: { textAlign?: string }) => {
          if (!attributes.textAlign) {
            return {};
          }
          return { style: `text-align: ${attributes.textAlign}` };
        },
      },
      // 인라인 업로드 상태 (HTML로 내보내지 않음)
      uploadId: {
        default: null,
        parseHTML: () => null,
        renderHTML: () => ({}),
      },
      uploadingProgress: {
        default: null,
        parseHTML: () => null,
        renderHTML: () => ({}),
      },
      uploadError: {
        default: null,
        parseHTML: () => null,
        renderHTML: () => ({}),
      },
      uploadErrorFileName: {
        default: null,
        parseHTML: () => null,
        renderHTML: () => ({}),
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView, { trackNodeViewPosition: true });
  },

  addProseMirrorPlugins() {
    return [
      imageUploadPlaceholderPlugin(),
      new Plugin({
        key: new PluginKey('imageNativeCopy'),
        props: {
          handleDOMEvents: {
            copy: (view) => {
              // 뷰어(읽기 전용)에서는 ProseMirror의 clipboard 직렬화를 우회하고
              // 브라우저 네이티브 복사를 사용하여 DOM의 <img> 요소가
              // 텍스트와 함께 그대로 복사되도록 합니다.
              if (!view.editable) return true;
              return false;
            },
          },
        },
      }),
    ];
  },

  addCommands() {
    return {
      setResizableImage:
        (options: {
          src: string;
          alt?: string;
          title?: string;
          caption?: string;
          width?: string;
          height?: string;
          textAlign?: string;
          uploadId?: string | null;
          uploadingProgress?: number | null;
        }) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ commands }: { commands: any }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: options.src,
              alt: options.alt || '',
              title: options.title || '',
              caption: options.caption || '',
              width: options.width || null,
              height: options.height || null,
              textAlign: options.textAlign || null,
              uploadId: options.uploadId ?? null,
              uploadingProgress: options.uploadingProgress ?? null,
            },
          });
        },
      /**
       * @deprecated decoration 기반 placeholder(`image-upload-placeholder.ts`)로 대체됨.
       * selection을 건드리지 않도록 위치 기반(`setNodeMarkup`)으로만 attr을 갱신한다.
       */
      updateImageUploadState:
        (
          uploadId: string,
          state: {
            progress?: number | null;
            src?: string;
            uploadError?: boolean;
            uploadErrorFileName?: string;
          }
        ) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ state: editorState, dispatch }: { state: any; dispatch: any }) => {
          let pos: number | null = null;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let found: any = null;
          editorState.doc.descendants((node: { type: { name: string }; attrs: { uploadId?: string } }, p: number) => {
            if (node.type.name === 'image' && node.attrs.uploadId === uploadId) {
              pos = p;
              found = node;
              return false; // stop
            }
          });
          if (pos == null || !found) return false;
          const attrs: {
            uploadingProgress?: number | null;
            src?: string;
            uploadId?: null;
            uploadError?: boolean;
            uploadErrorFileName?: string;
          } = {};
          if (state.progress !== undefined) attrs.uploadingProgress = state.progress;
          if (state.src !== undefined) {
            attrs.src = state.src;
            attrs.uploadingProgress = null;
            attrs.uploadId = null;
            attrs.uploadError = false;
            attrs.uploadErrorFileName = undefined;
          }
          if (state.uploadError !== undefined) {
            attrs.uploadError = state.uploadError;
            attrs.uploadingProgress = null;
            attrs.uploadId = null;
            if (state.uploadErrorFileName !== undefined) attrs.uploadErrorFileName = state.uploadErrorFileName;
          }
          if (dispatch) {
            dispatch(editorState.tr.setNodeMarkup(pos, undefined, { ...found.attrs, ...attrs }));
          }
          return true;
        },
    };
  },
});
