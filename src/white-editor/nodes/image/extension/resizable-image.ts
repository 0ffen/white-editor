import type { ResizableImageOptions } from '@/shared/utils/extensions';
import { ImageNodeView } from '@/white-editor';
import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import type { EditorExtensions } from '../../../editor/type/white-editor.type';

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
      }) => ReturnType;
    };
  }
}

export const ResizableImage = Image.extend<ResizableImageOptions>({
  name: 'image',

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
    // Extension 정보를 storage에 저장
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
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
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
            },
          });
        },
    };
  },
});
