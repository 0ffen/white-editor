export function tableCellRenderStyle(attrs: {
  backgroundColor?: string | null;
  colwidth?: number[] | null;
}): string | null {
  const parts: string[] = [];
  let totalWidth = 0;
  let fixedWidth = true;

  if (attrs.colwidth?.length) {
    for (const width of attrs.colwidth) {
      if (!width) {
        fixedWidth = false;
      } else {
        totalWidth += width;
      }
    }
    if (totalWidth > 0) {
      parts.push(fixedWidth ? `width: ${totalWidth}px` : `min-width: ${totalWidth}px`);
    }
  }

  if (attrs.backgroundColor) {
    parts.push(`background-color: ${attrs.backgroundColor}`);
  }

  return parts.length > 0 ? `${parts.join('; ')};` : null;
}

export function parseTableCellBackground(element: HTMLElement): string | null {
  return element.getAttribute('data-background-color') || element.style.backgroundColor || null;
}

export function parseTableColwidth(element: HTMLElement): number[] | null {
  const colwidth = element.getAttribute('colwidth');
  return colwidth ? colwidth.split(',').map((item) => parseInt(item, 10)) : null;
}
