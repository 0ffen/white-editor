// ─────────────────────────────────────────────────────────────
// 표 손질 명령 — stablyai/orca 에서 가져왔다 (MIT). 원본:
//   src/renderer/src/components/editor/rich-markdown-table-actions.ts
//   https://github.com/stablyai/orca  ·  Copyright (c) Stably AI, MIT License
//
//   `addRowAfter()` 같은 Tiptap 명령은 커서 기준이다. 호버 + / 핸들 메뉴는
//   마우스가 가리킨 셀(또는 표의 첫 셀)로 선택을 옮긴 뒤 명령을 실행한다.
// ─────────────────────────────────────────────────────────────
import type { TableActions } from '@/white-editor/nodes/table/type/table.type';
import { TextSelection, type Transaction } from '@tiptap/pm/state';
import { CellSelection, isInTable, selectionCell, TableMap } from '@tiptap/pm/tables';
import type { Editor } from '@tiptap/react';

export type TableActionTarget = { cellPosition: number } | { clientX: number; clientY: number };

export type TableAxis = 'column' | 'row';

export type TableAxisAction =
  | 'insertBefore'
  | 'insertAfter'
  | 'mergeCells'
  | 'splitCell'
  | 'duplicate'
  | 'clearContents'
  | 'delete';

type TableContext = {
  columnCount: number;
  hasHeaderRow: boolean;
  rowCount: number;
  selectedCellPositions: Set<number>;
  tablePosition: number;
};

function cellPositionAtDocumentPosition(editor: Editor, position: number): number | null {
  if (position < 0 || position > editor.state.doc.content.size) {
    return null;
  }
  const $position = editor.state.doc.resolve(position);
  for (let depth = $position.depth; depth > 0; depth -= 1) {
    const role = $position.node(depth).type.spec.tableRole;
    if (role === 'cell' || role === 'header_cell') {
      return $position.before(depth);
    }
  }
  return null;
}

export function tableCellPositionAtElement(editor: Editor, cell: HTMLTableCellElement): number | null {
  try {
    return cellPositionAtDocumentPosition(editor, editor.view.posAtDOM(cell, 0));
  } catch {
    return null;
  }
}

function cellPositionAtTarget(editor: Editor, target: TableActionTarget): number | null {
  if ('cellPosition' in target) {
    return cellPositionAtDocumentPosition(editor, target.cellPosition + 1);
  }
  try {
    const position = editor.view.posAtCoords({
      left: target.clientX,
      top: target.clientY,
    })?.pos;
    return position === undefined ? null : cellPositionAtDocumentPosition(editor, position);
  } catch {
    return null;
  }
}

function normalizeMultiCellSelection(editor: Editor): CellSelection | null {
  const { selection } = editor.state;
  if (selection instanceof CellSelection) {
    return selection;
  }
  if (selection.empty) {
    return null;
  }
  const anchor = cellPositionAtDocumentPosition(editor, selection.from);
  const head = cellPositionAtDocumentPosition(editor, selection.to);
  if (anchor === null || head === null || anchor === head) {
    return null;
  }
  try {
    return CellSelection.create(editor.state.doc, anchor, head);
  } catch {
    return null;
  }
}

function retargetTableSelection(editor: Editor, target?: TableActionTarget): number | null {
  const existingMultiCellSelection = normalizeMultiCellSelection(editor);
  if (existingMultiCellSelection && !(editor.state.selection instanceof CellSelection)) {
    editor.view.dispatch(editor.state.tr.setSelection(existingMultiCellSelection));
  }
  if (!target) {
    return isInTable(editor.state) ? selectionCell(editor.state).pos : null;
  }

  const cellPosition = cellPositionAtTarget(editor, target);
  if (cellPosition === null) {
    return null;
  }
  const selection = editor.state.selection;
  let selectedTarget = false;
  if (selection instanceof CellSelection) {
    selection.forEachCell((_cell, position) => {
      selectedTarget ||= position === cellPosition;
    });
  }
  if (!selectedTarget) {
    const caret = TextSelection.near(editor.state.doc.resolve(cellPosition + 1));
    editor.view.dispatch(editor.state.tr.setSelection(caret));
  }
  return cellPosition;
}

function tableContext(editor: Editor, targetCellPosition: number): TableContext | null {
  const $cell = editor.state.doc.resolve(targetCellPosition);
  if ($cell.nodeAfter?.type.spec.tableRole !== 'cell' && $cell.nodeAfter?.type.spec.tableRole !== 'header_cell') {
    return null;
  }
  let table: ReturnType<typeof $cell.node> | null = null;
  let tablePosition = 0;
  for (let depth = $cell.depth; depth > 0; depth -= 1) {
    const node = $cell.node(depth);
    if (node.type.spec.tableRole === 'table') {
      table = node;
      tablePosition = $cell.before(depth);
      break;
    }
  }
  if (!table) {
    return null;
  }
  const tableMap = TableMap.get(table);
  const selectedCellPositions = new Set<number>();
  const selection = editor.state.selection;
  if (selection instanceof CellSelection) {
    selection.forEachCell((_cell, position) => selectedCellPositions.add(position));
  } else {
    selectedCellPositions.add(targetCellPosition);
  }
  return {
    columnCount: tableMap.width,
    hasHeaderRow: table.firstChild?.firstChild?.type.spec.tableRole === 'header_cell',
    rowCount: tableMap.height,
    selectedCellPositions,
    tablePosition,
  };
}

function selectedTableCoverage(
  editor: Editor,
  context: TableContext
): { columns: Set<number>; rows: Set<number>; includesHeader: boolean } {
  const table = editor.state.doc.nodeAt(context.tablePosition);
  const columns = new Set<number>();
  const rows = new Set<number>();
  let includesHeader = false;
  if (!table) {
    return { columns, rows, includesHeader };
  }
  const tableMap = TableMap.get(table);
  const tableStart = context.tablePosition + 1;
  tableMap.map.forEach((cellOffset, index) => {
    const position = tableStart + cellOffset;
    if (!context.selectedCellPositions.has(position)) {
      return;
    }
    rows.add(Math.floor(index / tableMap.width));
    columns.add(index % tableMap.width);
    includesHeader ||= editor.state.doc.nodeAt(position)?.type.spec.tableRole === 'header_cell';
  });
  return { columns, rows, includesHeader };
}

function cellGridIndex(
  editor: Editor,
  tablePosition: number,
  cellPosition: number
): { column: number; row: number } | null {
  const table = editor.state.doc.nodeAt(tablePosition);
  if (!table) {
    return null;
  }
  const tableMap = TableMap.get(table);
  const offset = cellPosition - (tablePosition + 1);
  const index = tableMap.map.indexOf(offset);
  if (index < 0) {
    return null;
  }
  return {
    column: index % tableMap.width,
    row: Math.floor(index / tableMap.width),
  };
}

function axisCellPositions(transaction: Transaction, tablePosition: number, axis: TableAxis, index: number): number[] {
  const table = transaction.doc.nodeAt(tablePosition);
  if (!table) {
    return [];
  }
  const tableMap = TableMap.get(table);
  const tableStart = tablePosition + 1;
  const positions = new Set<number>();
  const count = axis === 'column' ? tableMap.height : tableMap.width;
  for (let cursor = 0; cursor < count; cursor += 1) {
    const mapIndex = axis === 'column' ? cursor * tableMap.width + index : index * tableMap.width + cursor;
    positions.add(tableStart + tableMap.map[mapIndex]);
  }
  return [...positions].sort((left, right) => right - left);
}

function copyCellContent(transaction: Transaction, fromPosition: number, toPosition: number): void {
  const from = transaction.doc.nodeAt(fromPosition);
  const to = transaction.doc.nodeAt(toPosition);
  if (!from || !to) {
    return;
  }
  transaction.replaceWith(toPosition + 1, toPosition + to.nodeSize - 1, from.content);
  if (from.attrs.backgroundColor !== to.attrs.backgroundColor) {
    transaction.setNodeMarkup(toPosition, undefined, {
      ...to.attrs,
      backgroundColor: from.attrs.backgroundColor ?? null,
    });
  }
}

function duplicateAxis(transaction: Transaction, tablePosition: number, axis: TableAxis, index: number): void {
  const source = axisCellPositions(transaction, tablePosition, axis, index).reverse();
  const copied = axisCellPositions(transaction, tablePosition, axis, index + 1).reverse();
  source.forEach((fromPosition, offset) => {
    const toPosition = copied[offset];
    if (toPosition !== undefined && fromPosition !== toPosition) {
      copyCellContent(transaction, fromPosition, toPosition);
    }
  });
}

function clearAxisContents(transaction: Transaction, tablePosition: number, axis: TableAxis, index: number): void {
  const paragraph = transaction.doc.type.schema.nodes.paragraph;
  if (!paragraph) {
    return;
  }
  for (const position of axisCellPositions(transaction, tablePosition, axis, index)) {
    const cell = transaction.doc.nodeAt(position);
    if (!cell) {
      continue;
    }
    transaction.replaceWith(position + 1, position + cell.nodeSize - 1, paragraph.create());
  }
}

function setAxisBackground(
  transaction: Transaction,
  tablePosition: number,
  axis: TableAxis,
  index: number,
  backgroundColor: string | null
): void {
  for (const position of axisCellPositions(transaction, tablePosition, axis, index)) {
    const cell = transaction.doc.nodeAt(position);
    if (!cell) {
      continue;
    }
    transaction.setNodeMarkup(position, undefined, {
      ...cell.attrs,
      backgroundColor,
    });
  }
}

function clearTableColwidths(transaction: Transaction, tablePosition: number): void {
  const table = transaction.doc.nodeAt(tablePosition);
  if (!table) {
    return;
  }
  table.descendants((cell, offset) => {
    const role = cell.type.spec.tableRole;
    if (role !== 'cell' && role !== 'header_cell') {
      return;
    }
    if (cell.attrs.colwidth == null) {
      return;
    }
    transaction.setNodeMarkup(tablePosition + 1 + offset, undefined, {
      ...cell.attrs,
      colwidth: null,
    });
  });
}

export function getTableHeaderState(editor: Editor, tablePosition: number): { column: boolean; row: boolean } {
  const table = editor.state.doc.nodeAt(tablePosition);
  if (!table || table.type.spec.tableRole !== 'table') {
    return { column: false, row: false };
  }

  const firstRow = table.firstChild;
  let row = Boolean(firstRow && firstRow.childCount > 0);
  firstRow?.forEach((cell) => {
    if (cell.type.spec.tableRole !== 'header_cell') {
      row = false;
    }
  });

  let column = table.childCount > 0;
  table.forEach((tableRow) => {
    if (tableRow.firstChild?.type.spec.tableRole !== 'header_cell') {
      column = false;
    }
  });

  return { column, row };
}

export function tablePositionFromEditor(editor: Editor): number | null {
  const { $from } = editor.state.selection;
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if ($from.node(depth).type.spec.tableRole === 'table') {
      return $from.before(depth);
    }
  }
  return null;
}

export function focusFirstTableCell(editor: Editor, tablePos: number): number | null {
  try {
    const table = editor.state.doc.nodeAt(tablePos);
    if (!table || table.type.spec.tableRole !== 'table') {
      return null;
    }

    let cellPos: number | null = null;
    table.descendants((node, pos) => {
      if (cellPos !== null) {
        return false;
      }
      const role = node.type.spec.tableRole;
      if (role === 'cell' || role === 'header_cell') {
        cellPos = tablePos + 1 + pos;
        return false;
      }
    });
    if (cellPos === null) {
      return null;
    }

    const caret = TextSelection.near(editor.state.doc.resolve(cellPos + 1));
    editor.view.dispatch(editor.state.tr.setSelection(caret));
    return cellPos;
  } catch {
    return null;
  }
}

export function runTableAction(editor: Editor, action: TableActions, target?: TableActionTarget): boolean {
  if (!editor.isEditable) {
    return false;
  }
  const targetCellPosition = retargetTableSelection(editor, target);
  if (targetCellPosition === null) {
    return false;
  }
  const context = tableContext(editor, targetCellPosition);
  if (!context) {
    return false;
  }
  const coverage = selectedTableCoverage(editor, context);
  const chain = editor.chain().focus();

  switch (action) {
    case 'addRowBefore':
      if (context.hasHeaderRow && coverage.includesHeader) {
        return false;
      }
      return chain.addRowBefore().run();
    case 'addRowAfter':
      return chain.addRowAfter().run();
    case 'deleteRow':
      if (coverage.rows.size >= context.rowCount) {
        return chain.deleteTable().run();
      }
      if (context.hasHeaderRow && coverage.includesHeader) {
        return false;
      }
      return chain.deleteRow().run();
    case 'addColumnBefore':
      return chain
        .addColumnBefore()
        .command(({ tr }) => {
          clearTableColwidths(tr, context.tablePosition);
          return true;
        })
        .run();
    case 'addColumnAfter':
      return chain
        .addColumnAfter()
        .command(({ tr }) => {
          clearTableColwidths(tr, context.tablePosition);
          return true;
        })
        .run();
    case 'fitToWidth':
      return chain
        .command(({ tr }) => {
          clearTableColwidths(tr, context.tablePosition);
          return true;
        })
        .run();
    case 'deleteColumn':
      if (coverage.columns.size >= context.columnCount) {
        return chain.deleteTable().run();
      }
      return chain.deleteColumn().run();
    case 'toggleHeaderColumn':
      return chain.toggleHeaderColumn().run();
    case 'toggleHeaderRow':
      return chain.toggleHeaderRow().run();
    case 'mergeCells':
      return chain.mergeCells().run();
    case 'splitCell':
      return chain.splitCell().run();
    case 'deleteTable':
      return chain.deleteTable().run();
    case 'insertTable':
      return false;
    default:
      return false;
  }
}

export function setTableAxisBackground(
  editor: Editor,
  axis: TableAxis,
  backgroundColor: string | null,
  target: TableActionTarget
): boolean {
  if (!editor.isEditable) {
    return false;
  }
  const targetCellPosition = retargetTableSelection(editor, target);
  if (targetCellPosition === null) {
    return false;
  }
  const context = tableContext(editor, targetCellPosition);
  const grid = context ? cellGridIndex(editor, context.tablePosition, targetCellPosition) : null;
  if (!context || !grid) {
    return false;
  }
  return editor
    .chain()
    .focus()
    .command(({ tr }) => {
      setAxisBackground(tr, context.tablePosition, axis, axis === 'column' ? grid.column : grid.row, backgroundColor);
      return true;
    })
    .run();
}

export type TableSelectionKind = 'cell' | 'row' | 'column' | 'range';

export function isSingleCellSelection(editor: Editor, cellPosition: number): boolean {
  const selection = editor.state.selection;
  if (!(selection instanceof CellSelection)) {
    return false;
  }
  let count = 0;
  let matches = false;
  selection.forEachCell((_cell, position) => {
    count += 1;
    matches ||= position === cellPosition;
  });
  return count === 1 && matches;
}

export function cellContainsPosition(editor: Editor, cellPosition: number, documentPosition: number): boolean {
  const cell = editor.state.doc.nodeAt(cellPosition);
  return Boolean(cell && documentPosition >= cellPosition && documentPosition <= cellPosition + cell.nodeSize);
}

export function selectTableCell(editor: Editor, cellPosition: number): boolean {
  if (!editor.isEditable) {
    return false;
  }
  try {
    const selection = CellSelection.create(editor.state.doc, cellPosition, cellPosition);
    editor.view.dispatch(editor.state.tr.setSelection(selection));
    return true;
  } catch {
    return false;
  }
}

export function editTableCell(editor: Editor, cellPosition: number, at?: number): boolean {
  const cell = editor.state.doc.nodeAt(cellPosition);
  if (!cell) {
    return false;
  }
  const from = cellPosition + 1;
  const to = cellPosition + cell.nodeSize - 1;
  const target = at != null && at >= from && at <= to ? at : to;
  try {
    const caret = TextSelection.near(editor.state.doc.resolve(target), target >= to ? -1 : 1);
    if (caret.from < from || caret.from > to) {
      editor.view.dispatch(editor.state.tr.setSelection(TextSelection.near(editor.state.doc.resolve(to), -1)));
      return true;
    }
    editor.view.dispatch(editor.state.tr.setSelection(caret));
    return true;
  } catch {
    return false;
  }
}

export function selectTableAxis(editor: Editor, axis: TableAxis, cellPosition: number): boolean {
  if (!editor.isEditable) {
    return false;
  }
  const context = tableContext(editor, cellPosition);
  const grid = context ? cellGridIndex(editor, context.tablePosition, cellPosition) : null;
  const table = context ? editor.state.doc.nodeAt(context.tablePosition) : null;
  if (!context || !grid || !table) {
    return false;
  }
  const map = TableMap.get(table);
  const tableStart = context.tablePosition + 1;
  const first = axis === 'row' ? tableStart + map.map[grid.row * map.width] : tableStart + map.map[grid.column];
  const last =
    axis === 'row'
      ? tableStart + map.map[grid.row * map.width + map.width - 1]
      : tableStart + map.map[(map.height - 1) * map.width + grid.column];
  try {
    const selection = CellSelection.create(editor.state.doc, first, last);
    editor.view.dispatch(editor.state.tr.setSelection(selection));
    return true;
  } catch {
    return false;
  }
}

export function tableSelectionKind(editor: Editor): TableSelectionKind | null {
  const selection = editor.state.selection;
  if (!(selection instanceof CellSelection)) {
    return null;
  }
  const targetCellPosition = selectionCell(editor.state).pos;
  const context = tableContext(editor, targetCellPosition);
  if (!context) {
    return null;
  }
  const coverage = selectedTableCoverage(editor, context);
  if (coverage.rows.size === 1 && coverage.columns.size === context.columnCount) {
    return 'row';
  }
  if (coverage.columns.size === 1 && coverage.rows.size === context.rowCount) {
    return 'column';
  }
  if (coverage.rows.size === 1 && coverage.columns.size === 1) {
    return 'cell';
  }
  return 'range';
}

export function isTableCellRangeSelection(editor: Editor): boolean {
  return tableSelectionKind(editor) === 'range';
}

function selectedCellPositions(editor: Editor): number[] {
  const selection = editor.state.selection;
  if (!(selection instanceof CellSelection)) {
    return [];
  }
  const positions: number[] = [];
  selection.forEachCell((_cell, position) => {
    positions.push(position);
  });
  return positions.sort((left, right) => right - left);
}

export function getCellSelectionRect(editor: Editor): DOMRect | null {
  const selection = editor.state.selection;
  if (!(selection instanceof CellSelection)) {
    return null;
  }
  let top = Number.POSITIVE_INFINITY;
  let left = Number.POSITIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  selection.forEachCell((_cell, position) => {
    const node = editor.view.nodeDOM(position);
    if (!(node instanceof HTMLElement)) {
      return;
    }
    const rect = node.getBoundingClientRect();
    top = Math.min(top, rect.top);
    left = Math.min(left, rect.left);
    bottom = Math.max(bottom, rect.bottom);
    right = Math.max(right, rect.right);
  });
  if (!Number.isFinite(top) || !Number.isFinite(left)) {
    return null;
  }
  return {
    top,
    left,
    bottom,
    right,
    width: right - left,
    height: bottom - top,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

export function clearSelectedCellContents(editor: Editor): boolean {
  if (!editor.isEditable) {
    return false;
  }
  const paragraph = editor.state.schema.nodes.paragraph;
  const positions = selectedCellPositions(editor);
  if (!paragraph || positions.length === 0) {
    return false;
  }
  return editor
    .chain()
    .focus()
    .command(({ tr }) => {
      for (const position of positions) {
        const cell = tr.doc.nodeAt(position);
        if (!cell) {
          continue;
        }
        tr.replaceWith(position + 1, position + cell.nodeSize - 1, paragraph.create());
      }
      return true;
    })
    .run();
}

export function setSelectedCellBackground(editor: Editor, backgroundColor: string | null): boolean {
  if (!editor.isEditable) {
    return false;
  }
  const positions = selectedCellPositions(editor);
  if (positions.length === 0) {
    return false;
  }
  return editor
    .chain()
    .focus()
    .command(({ tr }) => {
      for (const position of positions) {
        const cell = tr.doc.nodeAt(position);
        if (!cell) {
          continue;
        }
        tr.setNodeMarkup(position, undefined, {
          ...cell.attrs,
          backgroundColor,
        });
      }
      return true;
    })
    .run();
}

export function runTableAxisAction(
  editor: Editor,
  action: TableAxisAction,
  axis: TableAxis,
  target: TableActionTarget
): boolean {
  if (!editor.isEditable) {
    return false;
  }
  const targetCellPosition = retargetTableSelection(editor, target);
  if (targetCellPosition === null) {
    return false;
  }
  const context = tableContext(editor, targetCellPosition);
  const grid = context ? cellGridIndex(editor, context.tablePosition, targetCellPosition) : null;
  if (!context || !grid) {
    return false;
  }
  const index = axis === 'column' ? grid.column : grid.row;
  const isHeaderRow = axis === 'row' && context.hasHeaderRow && index === 0;

  switch (action) {
    case 'insertBefore':
      if (isHeaderRow) {
        return false;
      }
      return runTableAction(editor, axis === 'column' ? 'addColumnBefore' : 'addRowBefore', target);
    case 'insertAfter':
      return runTableAction(editor, axis === 'column' ? 'addColumnAfter' : 'addRowAfter', target);
    case 'mergeCells':
      return runTableAction(editor, 'mergeCells', target);
    case 'splitCell':
      return runTableAction(editor, 'splitCell', target);
    case 'duplicate':
      if (isHeaderRow) {
        return false;
      }
      return editor
        .chain()
        .focus()
        .command(({ commands }) => {
          return axis === 'column' ? commands.addColumnAfter() : commands.addRowAfter();
        })
        .command(({ tr }) => {
          duplicateAxis(tr, context.tablePosition, axis, index);
          if (axis === 'column') {
            clearTableColwidths(tr, context.tablePosition);
          }
          return true;
        })
        .run();
    case 'clearContents':
      return editor
        .chain()
        .focus()
        .command(({ tr }) => {
          clearAxisContents(tr, context.tablePosition, axis, index);
          return true;
        })
        .run();
    case 'delete':
      if (isHeaderRow) {
        return false;
      }
      return runTableAction(editor, axis === 'column' ? 'deleteColumn' : 'deleteRow', target);
    default:
      return false;
  }
}
