import { handleImageUpload } from '@/shared/utils';
import { ToolbarContainer } from './toolbar-container';

export const defaultToolbar = ToolbarContainer({
  groups: [
    {
      undo: {
        show: true,
      },
      redo: {
        show: true,
      },
    },
    {
      heading: {
        show: true,
      },
      textAlignLeft: {
        show: true,
      },
      textAlignCenter: {
        show: true,
      },
      textAlignRight: {
        show: true,
      },
      textAlignJustify: {
        show: true,
      },
    },
    {
      bulletList: {
        show: true,
      },
      orderedList: {
        show: true,
      },
      taskList: {
        show: true,
      },
      bold: {
        show: true,
      },
      italic: {
        show: true,
      },
      strike: {
        show: true,
      },
      color: {
        show: true,
      },
      highlight: {
        show: true,
      },
      link: {
        show: true,
      },
    },
    {
      table: {
        show: true,
      },
      code: {
        show: true,
      },
      codeblock: {
        show: true,
      },
      inlineMath: {
        show: true,
      },
      blockMath: {
        show: true,
      },
      imageUpload: {
        show: true,
        props: {
          imageConfig: {
            accept: 'image/*',
            maxSize: 10 * 1024 * 1024,
            limit: 1,
            upload: handleImageUpload,
            onError: (error) => {
              console.error('Upload failed:', error);
            },
          },
        },
      },
    },
    {
      theme: true,
    },
  ],
});
