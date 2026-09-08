// ─────────────────────────────────────────────────────────────
// 표 가장자리 + / 손잡이 — stablyai/orca 에서 가져왔다 (MIT). 원본:
//   src/renderer/src/components/editor/RichMarkdownTableControls.tsx
//   https://github.com/stablyai/orca  ·  Copyright (c) Stably AI, MIT License
//
//   표의 아래·오른쪽 선에 마우스를 대면 + 가 뜨고, 표 위·왼쪽 가장자리에는
//   행/열 손잡이가 뜬다. 손잡이를 누르면 그 축 전체가 선택되고 메뉴가 열린다.
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
  if (axis === 'column') {
    const index = cell.cellIndex;
    return Array.from(table.rows).flatMap((row) => {
      const next = row.cells.item(index);
      return next ? [next] : [];
    });
  }
  const row = cell.closest('tr');
  return row ? Array.from(row.cells) : [];
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
    const table = active?.table;
    if (!table) {
      return;
    }
    if (selectionKind) {
      table.dataset.weSelection = selectionKind;
    } else {
      delete table.dataset.weSelection;
    }
    return () => {
      delete table.dataset.weSelection;
    };
  }, [active?.table, selectionKind]);

  useEffect(() => {
    const table = active?.table;
    const cell = active?.cell;
    const axis = openAxis ? null : hoveredAxis;
    if (!table || !cell || !axis) {
      return;
    }
    table.dataset.wePreview = axis;
    const highlighted = axisCells(table, cell, axis);
    highlighted.forEach((item) => item.classList.add('we-table-axis-cell'));
    return () => {
      delete table.dataset.wePreview;
      highlighted.forEach((item) => item.classList.remove('we-table-axis-cell'));
    };
  }, [active?.cell, active?.table, hoveredAxis, openAxis]);

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

  return (
    <div className={cn('we-table-controls')} role='group' aria-label={t('table')}>
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
