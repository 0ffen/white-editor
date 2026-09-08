// ─────────────────────────────────────────────────────────────
// 표 가장자리 + / 손잡이 좌표 — stablyai/orca 에서 가져왔다 (MIT). 원본:
//   src/renderer/src/components/editor/rich-markdown-table-control-layout.ts
//   https://github.com/stablyai/orca  ·  Copyright (c) Stably AI, MIT License
//
//   + 띠는 표 한 변만큼 길어진다. 열/행 손잡이는 표 가장자리(위·왼쪽) 가운데에 둔다.
// ─────────────────────────────────────────────────────────────

export type TableControlPoint = { left: number; top: number };

type ContentRect = { bottom: number; left: number; right: number; top: number };

type TableControlLayoutInput = {
  cell: ContentRect;
  container: {
    clientHeight: number;
    clientWidth: number;
    scrollLeft: number;
    scrollTop: number;
  };
  row: ContentRect;
  table: ContentRect;
};

export type TableControlLayout = {
  addColumnLeft: TableControlPoint;
  addColumnRight: TableControlPoint;
  addRow: TableControlPoint;
  columnMenu: TableControlPoint;
  rowMenu: TableControlPoint;
};

export const TABLE_ADD_STRIP_THICKNESS = 24;
const EDGE_GAP = 4;
const GUTTER = 14;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
}

function center(start: number, end: number, size: number): number {
  return (start + end - size) / 2;
}

export function getVisibleTableSize(
  table: ContentRect,
  container: TableControlLayoutInput['container']
): { height: number; width: number } {
  const viewportRight = container.scrollLeft + container.clientWidth - EDGE_GAP;
  const viewportBottom = container.scrollTop + container.clientHeight - EDGE_GAP;
  return {
    width: Math.max(0, Math.min(table.right, viewportRight) - Math.max(table.left, container.scrollLeft + EDGE_GAP)),
    height: Math.max(0, Math.min(table.bottom, viewportBottom) - Math.max(table.top, container.scrollTop + EDGE_GAP)),
  };
}

export function getTableControlLayout({ container, cell, row, table }: TableControlLayoutInput): TableControlLayout {
  const minimumLeft = container.scrollLeft + EDGE_GAP - GUTTER;
  const maximumLeft = container.scrollLeft + container.clientWidth - TABLE_ADD_STRIP_THICKNESS - EDGE_GAP + GUTTER;
  const minimumTop = container.scrollTop + EDGE_GAP - GUTTER;
  const maximumTop = container.scrollTop + container.clientHeight - TABLE_ADD_STRIP_THICKNESS - EDGE_GAP + GUTTER;
  const visibleLeft = (value: number): number => clamp(value, minimumLeft, maximumLeft);
  const visibleTop = (value: number): number => clamp(value, minimumTop, maximumTop);

  return {
    addColumnLeft: {
      left: visibleLeft(table.left),
      top: visibleTop(table.top),
    },
    addColumnRight: {
      left: visibleLeft(table.right - TABLE_ADD_STRIP_THICKNESS),
      top: visibleTop(table.top),
    },
    addRow: {
      left: visibleLeft(table.left),
      top: visibleTop(table.bottom + EDGE_GAP),
    },
    columnMenu: {
      left: visibleLeft(center(cell.left, cell.right, 0)),
      top: visibleTop(table.top),
    },
    rowMenu: {
      left: visibleLeft(table.left),
      top: visibleTop(center(row.top, row.bottom, 0)),
    },
  };
}
