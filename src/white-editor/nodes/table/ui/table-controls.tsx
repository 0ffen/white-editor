// ─────────────────────────────────────────────────────────────
// 표 가장자리 + / 손잡이 — stablyai/orca 에서 가져왔다 (MIT). 원본:
//   src/renderer/src/components/editor/RichMarkdownTableControls.tsx
//   https://github.com/stablyai/orca  ·  Copyright (c) Stably AI, MIT License
//
//   표 아래·옆에 마우스를 대면 행/열 추가 + 가 뜨고, 표 위·왼쪽 가장자리에는
//   행/열 손잡이가 뜬다. 오른쪽 선은 열 리사이즈가 쓴다.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState, type CSSProperties, type RefObject } from 'react';
import { Plus } from 'lucide-react';
import { useTranslate } from '@/shared';
import { cn } from '@/shared/utils';
import { useTableControlTarget, type TableAddAxis } from '@/white-editor/nodes/table/hook/use-table-controls';
import { TableAxisMenu } from '@/white-editor/nodes/table/ui/table-axis-menu';
import {
  runTableAction,
  tableCellPositionAtElement,
  type TableAxis,
} from '@/white-editor/nodes/table/util/run-table-action';
import { getTableControlLayout, getVisibleTableSize } from '@/white-editor/nodes/table/util/table-control-layout';
import type { Editor } from '@tiptap/react';
import type { TableActions } from '../type/table.type';

function contentRect(element: Element, container: HTMLElement) {
  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  return {
    bottom: elementRect.bottom - containerRect.top + container.scrollTop,
    left: elementRect.left - containerRect.left + container.scrollLeft,
    right: elementRect.right - containerRect.left + container.scrollLeft,
    top: elementRect.top - containerRect.top + container.scrollTop,
  };
}

function AddControl({
  axis,
  label,
  onClick,
  style,
}: {
  axis: TableAddAxis;
  label: string;
  onClick: () => void;
  style: CSSProperties;
}) {
  return (
    <button
      type='button'
      className='we-table-control we-table-add-control'
      style={style}
      aria-label={label}
      title={label}
      data-axis={axis}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      <Plus className='we:size-3.5' aria-hidden />
    </button>
  );
}

function axisCells(table: HTMLTableElement, cell: HTMLTableCellElement, axis: TableAxis): HTMLTableCellElement[] {
  const origin = cell.getBoundingClientRect();
  const epsilon = 2;
  const cells = Array.from(table.querySelectorAll<HTMLTableCellElement>('th, td'));
  if (axis === 'column') {
    return cells.filter((item) => {
      const rect = item.getBoundingClientRect();
      return rect.left < origin.right - epsilon && rect.right > origin.left + epsilon;
    });
  }
  return cells.filter((item) => {
    const rect = item.getBoundingClientRect();
    return rect.top < origin.bottom - epsilon && rect.bottom > origin.top + epsilon;
  });
}

function unionContentRect(cells: HTMLTableCellElement[], container: HTMLElement) {
  const rects = cells.map((cell) => contentRect(cell, container));
  return {
    left: Math.min(...rects.map((rect) => rect.left)),
    top: Math.min(...rects.map((rect) => rect.top)),
    right: Math.max(...rects.map((rect) => rect.right)),
    bottom: Math.max(...rects.map((rect) => rect.bottom)),
  };
}

export function TableControls({
  disabled = false,
  editor,
  containerRef,
}: {
  disabled?: boolean;
  editor: Editor | null;
  containerRef: RefObject<HTMLElement | null>;
}) {
  const t = useTranslate();
  const { active, hoveredAddAxis, hoveredAxis, selectionKind } = useTableControlTarget(editor, containerRef);
  const [openAxis, setOpenAxis] = useState<TableAxis | null>(null);

  const container = containerRef.current;
  const cellPosition = editor && active?.cell.isConnected ? tableCellPositionAtElement(editor, active.cell) : null;
  const showHandles = Boolean(active && cellPosition !== null) && (openAxis !== null || hoveredAddAxis === null);
  const showColumn = showHandles && openAxis !== 'row' && selectionKind !== 'row' && selectionKind !== 'range';
  const showRow = showHandles && openAxis !== 'column' && selectionKind !== 'column' && selectionKind !== 'range';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    if (selectionKind) {
      container.dataset.weSelection = selectionKind;
    } else {
      delete container.dataset.weSelection;
    }
    return () => {
      delete container.dataset.weSelection;
    };
  }, [containerRef, selectionKind]);

  if (
    disabled ||
    !editor ||
    !editor.isEditable ||
    !container ||
    !active?.cell.isConnected ||
    !active.table.isConnected
  ) {
    return null;
  }

  const finalRow = active.table.rows.item(active.table.rows.length - 1);
  const firstRow = active.table.rows.item(0);
  const addRowCell = finalRow?.cells.item(0) ?? null;
  const addColumnRightCell = firstRow?.cells.item((firstRow?.cells.length ?? 1) - 1) ?? null;
  const addRowPosition = addRowCell ? tableCellPositionAtElement(editor, addRowCell) : null;
  const addColumnRightPosition = addColumnRightCell ? tableCellPositionAtElement(editor, addColumnRightCell) : null;
  const row = active.cell.closest('tr');

  const tableRect = contentRect(active.table, container);
  const layout = getTableControlLayout({
    cell: contentRect(active.cell, container),
    container,
    row: row ? contentRect(row, container) : tableRect,
    table: tableRect,
  });
  const visible = getVisibleTableSize(tableRect, container);
  const style = (point: { left: number; top: number }, size?: { height?: number; width?: number }): CSSProperties => ({
    left: point.left,
    top: point.top,
    ...(size?.width != null ? { width: size.width } : {}),
    ...(size?.height != null ? { height: size.height } : {}),
  });

  const run = (action: TableActions, position: number | null) => {
    if (position === null) return;
    runTableAction(editor, action, { cellPosition: position });
  };

  const addRowLabel = t('행 추가');
  const addColumnLabel = t('열 추가');
  const isHeaderRow = active.cell.tagName === 'TH' && active.cell.parentElement === firstRow;
  const previewAxis = openAxis ? null : hoveredAxis;
  const previewCells = previewAxis ? axisCells(active.table, active.cell, previewAxis) : [];
  const previewRect = previewCells.length > 0 ? unionContentRect(previewCells, container) : null;

  return (
    <div className={cn('we-table-controls')} role='group' aria-label={t('table')}>
      {previewRect && previewAxis ? (
        <div
          className='we-table-axis-preview'
          data-axis={previewAxis}
          style={style(
            { left: previewRect.left, top: previewRect.top },
            {
              width: previewRect.right - previewRect.left,
              height: previewRect.bottom - previewRect.top,
            }
          )}
        />
      ) : null}
      {showColumn && cellPosition !== null ? (
        <TableAxisMenu
          axis='column'
          cellPosition={cellPosition}
          editor={editor}
          emphasized={hoveredAxis === 'column' || openAxis === 'column'}
          isHeaderRow={false}
          open={openAxis === 'column'}
          style={style(layout.columnMenu)}
          onOpenChange={(open) => setOpenAxis(open ? 'column' : null)}
        />
      ) : null}
      {showRow && cellPosition !== null ? (
        <TableAxisMenu
          axis='row'
          cellPosition={cellPosition}
          editor={editor}
          emphasized={hoveredAxis === 'row' || openAxis === 'row'}
          isHeaderRow={isHeaderRow}
          open={openAxis === 'row'}
          style={style(layout.rowMenu)}
          onOpenChange={(open) => setOpenAxis(open ? 'row' : null)}
        />
      ) : null}
      {hoveredAddAxis === 'column-right' && addColumnRightPosition !== null && visible.height > 0 ? (
        <AddControl
          axis='column-right'
          label={addColumnLabel}
          style={style(layout.addColumnRight, { height: visible.height })}
          onClick={() => run('addColumnAfter', addColumnRightPosition)}
        />
      ) : null}
      {hoveredAddAxis === 'row' && addRowPosition !== null && visible.width > 0 ? (
        <AddControl
          axis='row'
          label={addRowLabel}
          style={style(layout.addRow, { width: visible.width })}
          onClick={() => run('addRowAfter', addRowPosition)}
        />
      ) : null}
    </div>
  );
}
