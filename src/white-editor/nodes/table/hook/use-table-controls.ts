// ─────────────────────────────────────────────────────────────
// 지금 어느 셀 위에 있나 — stablyai/orca 에서 가져왔다 (MIT). 원본:
//   src/renderer/src/components/editor/use-rich-markdown-table-control-target.ts
//   https://github.com/stablyai/orca  ·  Copyright (c) Stably AI, MIT License
//
//   표의 아래 가장자리 8px 에 닿으면 행 추가 + 를 띄운다.
//   열 추가 + 는 오른쪽 선(리사이즈)과 겹치지 않게 표 옆 거터에서만 띄운다.
//   위·왼쪽 가장자리는 열/행 손잡이 영역이다.
// ─────────────────────────────────────────────────────────────
import { useEffect, useRef, useState, type RefObject } from 'react';
import {
  cellContainsPosition,
  editTableCell,
  isSingleCellSelection,
  selectTableCell,
  tableCellPositionAtElement,
  tableSelectionKind,
  type TableAxis,
  type TableSelectionKind,
} from '@/white-editor/nodes/table/util/run-table-action';
import { TABLE_ADD_STRIP_THICKNESS } from '@/white-editor/nodes/table/util/table-control-layout';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { CellSelection, isInTable, selectionCell } from '@tiptap/pm/tables';
import type { Editor } from '@tiptap/react';

export type ActiveTableCell = {
  cell: HTMLTableCellElement;
  table: HTMLTableElement;
};

export type TableAddAxis = 'column-left' | 'column-right' | 'row';

type PointerSample = { cell: HTMLTableCellElement; x: number; y: number };
type PendingCellClick = { cellPosition: number; mode: 'edit' | 'select'; pos?: number; x: number; y: number };

const TABLE_EDGE_HIT_AREA = 8;
const TABLE_ADD_GUTTER_HIT = TABLE_ADD_STRIP_THICKNESS + TABLE_EDGE_HIT_AREA;
const CELL_CLICK_DRAG_THRESHOLD = 4;
const tableCellClickKey = new PluginKey('weTableCellClick');

function tableCellFromTarget(target: EventTarget | null): HTMLTableCellElement | null {
  return target instanceof Element ? target.closest<HTMLTableCellElement>('td, th') : null;
}

function selectionTableCell(editor: Editor): HTMLTableCellElement | null {
  if (!isInTable(editor.state)) {
    return null;
  }
  const node = editor.view.nodeDOM(selectionCell(editor.state).pos);
  return node instanceof HTMLTableCellElement ? node : null;
}

function pointerAddAxis(sample: PointerSample): TableAddAxis | null {
  const table = sample.cell.closest('table');
  if (!(table instanceof HTMLTableElement)) {
    return null;
  }
  const tableRect = table.getBoundingClientRect();
  if (sample.y >= tableRect.bottom - TABLE_EDGE_HIT_AREA) {
    return 'row';
  }
  return null;
}

function tableGutterHit(
  editorDom: HTMLElement,
  x: number,
  y: number
): { axis: Exclude<TableAddAxis, 'column-left'>; table: HTMLTableElement } | null {
  for (const table of editorDom.querySelectorAll('table')) {
    if (!(table instanceof HTMLTableElement)) {
      continue;
    }
    const rect = table.getBoundingClientRect();
    if (y >= rect.top && y <= rect.bottom && x >= rect.right && x <= rect.right + TABLE_ADD_GUTTER_HIT) {
      return { axis: 'column-right', table };
    }
    if (x >= rect.left && x <= rect.right && y >= rect.bottom && y <= rect.bottom + TABLE_ADD_GUTTER_HIT) {
      return { axis: 'row', table };
    }
  }
  return null;
}

function cellForGutter(
  table: HTMLTableElement,
  axis: Exclude<TableAddAxis, 'column-left'>,
  x: number,
  y: number
): HTMLTableCellElement | null {
  if (axis === 'column-right') {
    for (const row of Array.from(table.rows)) {
      const rowRect = row.getBoundingClientRect();
      if (y >= rowRect.top && y <= rowRect.bottom) {
        return row.cells.item(row.cells.length - 1);
      }
    }
    const first = table.rows.item(0);
    return first?.cells.item((first.cells.length ?? 1) - 1) ?? null;
  }
  const last = table.rows.item(table.rows.length - 1);
  if (!last) {
    return null;
  }
  for (const cell of Array.from(last.cells)) {
    const cellRect = cell.getBoundingClientRect();
    if (x >= cellRect.left && x <= cellRect.right) {
      return cell;
    }
  }
  return last.cells.item(0);
}

function pointerAxis(sample: PointerSample): TableAxis | null {
  const table = sample.cell.closest('table');
  if (!(table instanceof HTMLTableElement)) {
    return null;
  }
  const tableRect = table.getBoundingClientRect();
  if (sample.y - tableRect.top <= TABLE_EDGE_HIT_AREA) {
    return 'column';
  }
  if (sample.x - tableRect.left <= TABLE_EDGE_HIT_AREA) {
    return 'row';
  }
  return null;
}

function isTypingKey(event: KeyboardEvent): boolean {
  if (event.metaKey || event.ctrlKey || event.altKey) {
    return false;
  }
  if (event.key === 'Enter' || event.key === 'Backspace' || event.key === 'Delete') {
    return true;
  }
  return event.key.length === 1;
}

export function useTableControlTarget(
  editor: Editor | null,
  containerRef: RefObject<HTMLElement | null>
): {
  active: ActiveTableCell | null;
  hoveredAddAxis: TableAddAxis | null;
  hoveredAxis: TableAxis | null;
  selectionKind: TableSelectionKind | null;
} {
  const [active, setActive] = useState<ActiveTableCell | null>(null);
  const [hoveredAddAxis, setHoveredAddAxis] = useState<TableAddAxis | null>(null);
  const [hoveredAxis, setHoveredAxis] = useState<TableAxis | null>(null);
  const [selectionKind, setSelectionKind] = useState<TableSelectionKind | null>(null);
  const [, setLayoutVersion] = useState(0);
  const pendingPointerRef = useRef<PointerSample | null>(null);
  const pendingClickRef = useRef<PendingCellClick | null>(null);
  const pointerFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!editor || !container) {
      return;
    }
    const editorDom = editor.view.dom;
    const activate = (cell: HTMLTableCellElement | null): void => {
      setActive((current) => {
        if (current?.cell === cell) {
          return current;
        }
        const table = cell?.closest('table');
        return cell && table instanceof HTMLTableElement ? { cell, table } : null;
      });
    };
    const activateSelection = (): void => {
      pendingPointerRef.current = null;
      setHoveredAddAxis(null);
      setHoveredAxis(null);
      setSelectionKind(tableSelectionKind(editor));
      activate(selectionTableCell(editor));
    };
    const flushPointer = (): void => {
      pointerFrameRef.current = null;
      const sample = pendingPointerRef.current;
      pendingPointerRef.current = null;
      if (!sample?.cell.isConnected || !editorDom.contains(sample.cell)) {
        return;
      }
      setHoveredAddAxis(pointerAddAxis(sample));
      setHoveredAxis(pointerAxis(sample));
    };
    const cancelPointerFlush = (): void => {
      if (pointerFrameRef.current !== null) {
        window.cancelAnimationFrame(pointerFrameRef.current);
        pointerFrameRef.current = null;
      }
      pendingPointerRef.current = null;
    };
    const onPointerMove = (event: PointerEvent): void => {
      const cell = tableCellFromTarget(event.target);
      if (cell && editorDom.contains(cell)) {
        activate(cell);
        pendingPointerRef.current = {
          cell,
          x: event.clientX,
          y: event.clientY,
        };
        pointerFrameRef.current ??= window.requestAnimationFrame(flushPointer);
        return;
      }
      if (event.target instanceof Element && event.target.closest('.we-table-controls')) {
        return;
      }
      const gutter = tableGutterHit(editorDom, event.clientX, event.clientY);
      const gutterCell = gutter ? cellForGutter(gutter.table, gutter.axis, event.clientX, event.clientY) : null;
      if (gutter && gutterCell) {
        cancelPointerFlush();
        activate(gutterCell);
        setHoveredAddAxis(gutter.axis);
        setHoveredAxis(null);
        return;
      }
      cancelPointerFlush();
      activateSelection();
    };
    const onPointerDown = (event: PointerEvent): void => {
      if (event.button !== 0) {
        pendingClickRef.current = null;
        return;
      }
      if (event.target instanceof Element && event.target.closest('.we-table-controls')) {
        pendingClickRef.current = null;
        return;
      }
      const cell = tableCellFromTarget(event.target);
      if (!cell || !editorDom.contains(cell)) {
        pendingClickRef.current = null;
        return;
      }
      const cellPosition = tableCellPositionAtElement(editor, cell);
      if (cellPosition === null) {
        pendingClickRef.current = null;
        return;
      }
      const { selection } = editor.state;
      const selectedThisCell = isSingleCellSelection(editor, cellPosition);
      const editingThisCell =
        !(selection instanceof CellSelection) && cellContainsPosition(editor, cellPosition, selection.from);
      if (editingThisCell) {
        pendingClickRef.current = null;
        return;
      }
      pendingClickRef.current = {
        cellPosition,
        mode: selectedThisCell ? 'edit' : 'select',
        pos: editor.view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos,
        x: event.clientX,
        y: event.clientY,
      };
    };
    editor.registerPlugin(
      new Plugin({
        key: tableCellClickKey,
        props: {
          handleClick: (_view, pos, event) => {
            const pending = pendingClickRef.current;
            pendingClickRef.current = null;
            if (!pending) {
              return false;
            }
            if (Math.hypot(event.clientX - pending.x, event.clientY - pending.y) > CELL_CLICK_DRAG_THRESHOLD) {
              return false;
            }
            if (pending.mode === 'select') {
              return selectTableCell(editor, pending.cellPosition);
            }
            return editTableCell(editor, pending.cellPosition, pos ?? pending.pos);
          },
        },
      })
    );
    const onKeyDown = (event: KeyboardEvent): void => {
      if (!isTypingKey(event)) {
        return;
      }
      if (tableSelectionKind(editor) !== 'cell') {
        return;
      }
      editTableCell(editor, selectionCell(editor.state).pos);
    };
    container.addEventListener('pointermove', onPointerMove);
    editorDom.addEventListener('pointerdown', onPointerDown);
    editorDom.addEventListener('keydown', onKeyDown, true);
    editor.on('selectionUpdate', activateSelection);
    editor.on('update', activateSelection);
    activateSelection();
    return () => {
      container.removeEventListener('pointermove', onPointerMove);
      editorDom.removeEventListener('pointerdown', onPointerDown);
      editorDom.removeEventListener('keydown', onKeyDown, true);
      editor.unregisterPlugin(tableCellClickKey);
      editor.off('selectionUpdate', activateSelection);
      editor.off('update', activateSelection);
      if (pointerFrameRef.current !== null) {
        window.cancelAnimationFrame(pointerFrameRef.current);
        pointerFrameRef.current = null;
      }
      pendingPointerRef.current = null;
      pendingClickRef.current = null;
    };
  }, [editor, containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    const table = active?.table;
    if (!table || !container) {
      return;
    }
    let layoutFrame: number | null = null;
    const update = (): void => {
      layoutFrame ??= window.requestAnimationFrame(() => {
        layoutFrame = null;
        setLayoutVersion((version) => version + 1);
      });
    };
    const observer = new ResizeObserver(update);
    observer.observe(table);
    observer.observe(container);
    container.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      container.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      if (layoutFrame !== null) {
        window.cancelAnimationFrame(layoutFrame);
      }
    };
  }, [active?.table, containerRef]);

  return { active, hoveredAddAxis, hoveredAxis, selectionKind };
}
