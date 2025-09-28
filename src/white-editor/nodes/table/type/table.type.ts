import { type ComponentType } from 'react';
import { TableColumnsSplit, Trash2Icon, type LucideProps } from 'lucide-react';
import AddColumnLeftIcon from '@/assets/icons/table/add-column-left.svg?react';
import AddColumnRightIcon from '@/assets/icons/table/add-column-right.svg?react';
import AddRowAboveIcon from '@/assets/icons/table/add-row-above.svg?react';
import AddRowBelowIcon from '@/assets/icons/table/add-row-below.svg?react';
import CellMergeIcon from '@/assets/icons/table/cell-merge.svg?react';
import DeleteColumnIcon from '@/assets/icons/table/delete-col-right.svg?react';
import DeleteRowIcon from '@/assets/icons/table/delete-row-below.svg?react';
import ToggleHeaderColIcon from '@/assets/icons/table/toggle-th-col.svg?react';
import ToggleHeaderRowIcon from '@/assets/icons/table/toggle-th-row.svg?react';

type TableActions =
  | 'insertTable'
  | 'toggleHeaderColumn'
  | 'addColumnBefore'
  | 'addColumnAfter'
  | 'deleteColumn'
  | 'toggleHeaderRow'
  | 'addRowBefore'
  | 'addRowAfter'
  | 'deleteRow'
  | 'mergeCells'
  | 'splitCell'
  | 'deleteTable';

type TableActionGroup = 'insert' | 'column' | 'row' | 'cell' | 'delete';

interface TableActionItem {
  label: string;
  action: TableActions;
  icon: ComponentType<LucideProps>;
  group: TableActionGroup;
}

const tableActions: TableActionItem[] = [
  {
    label: 'Add Left Column',
    action: 'addColumnBefore',
    icon: AddColumnLeftIcon,
    group: 'column',
  },
  {
    label: 'Add Right Column',
    action: 'addColumnAfter',
    icon: AddColumnRightIcon,
    group: 'column',
  },
  {
    label: 'Delete Column',
    action: 'deleteColumn',
    icon: DeleteColumnIcon,
    group: 'column',
  },
  {
    label: 'Add Row Above',
    action: 'addRowBefore',
    icon: AddRowAboveIcon,
    group: 'row',
  },
  {
    label: 'Add Row Below',
    action: 'addRowAfter',
    icon: AddRowBelowIcon,
    group: 'row',
  },
  {
    label: 'Delete Row',
    action: 'deleteRow',
    icon: DeleteRowIcon,
    group: 'row',
  },
  {
    label: 'Toggle Header Column',
    action: 'toggleHeaderColumn',
    icon: ToggleHeaderColIcon,
    group: 'column',
  },
  {
    label: 'Toggle Header Row',
    action: 'toggleHeaderRow',
    icon: ToggleHeaderRowIcon,
    group: 'row',
  },
  {
    label: 'Merge Cells',
    action: 'mergeCells',
    icon: CellMergeIcon,
    group: 'cell',
  },
  {
    label: 'Split Cell',
    action: 'splitCell',
    icon: TableColumnsSplit,
    group: 'cell',
  },
  {
    label: 'Delete Table',
    action: 'deleteTable',
    icon: Trash2Icon,
    group: 'delete',
  },
];

export { tableActions };
export type { TableActions, TableActionGroup, TableActionItem };
