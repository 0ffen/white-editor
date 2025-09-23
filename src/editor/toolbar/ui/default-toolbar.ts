import { ToolbarContainer } from './toolbar-container';

export const defaultToolbar = ToolbarContainer({
  groups: [
    {
      undo: true,
      redo: true,
    },
    {
      heading: {
        options: [
          { label: 'Normal Text', level: null },
          { label: 'Heading 1', level: 1 },
          { label: 'Heading 2', level: 2 },
          { label: 'Heading 3', level: 3 },
        ],
      },
      textAlign: ['left', 'center', 'right'],
    },
    {
      list: ['bulletList', 'orderedList', 'taskList'],
      marks: ['bold', 'italic', 'strike', 'code', 'underline', 'superscript', 'subscript'],
      color: true,
      highlight: true,
      link: true,
      table: true,
      codeblock: true,
      math: ['inline', 'block'],
    },
    {
      imageUpload: true,
      theme: true,
    },
  ],
});
