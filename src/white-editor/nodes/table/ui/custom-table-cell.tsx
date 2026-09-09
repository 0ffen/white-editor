import { mergeAttributes } from '@tiptap/core';
import { TableCell } from '@tiptap/extension-table';
import { parseTableCellBackground, parseTableColwidth, tableCellRenderStyle } from '../util/table-cell-html';

export const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      colspan: {
        default: 1,
      },
      rowspan: {
        default: 1,
      },
      colwidth: {
        default: null,
        parseHTML: (element) => parseTableColwidth(element),
      },
      backgroundColor: {
        default: null,
        parseHTML: (element) => parseTableCellBackground(element),
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    const { backgroundColor, ...attributes } = HTMLAttributes;
    const colwidth = HTMLAttributes.colwidth;
    const style = tableCellRenderStyle({ backgroundColor, colwidth });
    return [
      'td',
      mergeAttributes(this.options.HTMLAttributes, attributes, {
        ...(style ? { style } : {}),
        ...(backgroundColor ? { 'data-background-color': backgroundColor } : {}),
      }),
      0,
    ];
  },
});
