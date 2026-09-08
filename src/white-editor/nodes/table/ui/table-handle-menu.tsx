import { useCallback, useEffect, useState } from 'react';
import { ArrowLeftRight, Trash2Icon } from 'lucide-react';
import AddColumnLeftIcon from '@/assets/icons/table/add-column-left.svg?react';
import AddColumnRightIcon from '@/assets/icons/table/add-column-right.svg?react';
import AddRowBelowIcon from '@/assets/icons/table/add-row-below.svg?react';
import ToggleHeaderColIcon from '@/assets/icons/table/toggle-th-col.svg?react';
import ToggleHeaderRowIcon from '@/assets/icons/table/toggle-th-row.svg?react';
import { useTranslate } from '@/shared';
import { Popover, PopoverAnchor, PopoverContent } from '@/shared/components';
import { cn } from '@/shared/utils';
import { canExecuteAction } from '@/white-editor/nodes/table/hook/use-table-toolbar';
import {
  getTableHeaderState,
  runTableAction,
  tablePositionFromEditor,
} from '@/white-editor/nodes/table/util/run-table-action';
import type { Editor } from '@tiptap/react';
import type { TableActions } from '../type/table.type';

function MenuSwitch({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'we:relative we:inline-flex we:h-4 we:w-7 we:shrink-0 we:rounded-full we:transition-colors',
        checked ? 'we:bg-brand-default' : 'we:bg-border-default'
      )}
    >
      <span
        className={cn(
          'we:absolute we:top-0.5 we:size-3 we:rounded-full we:bg-elevation-background we:shadow-sm we:transition-[left]',
          checked ? 'we:left-3.5' : 'we:left-0.5'
        )}
      />
    </span>
  );
}

function MenuItem({
  children,
  checked,
  destructive = false,
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  checked?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      disabled={disabled}
      role={checked === undefined ? undefined : 'switch'}
      aria-checked={checked}
      className={cn(
        'we:focus:bg-interaction-hover we:relative we:flex we:w-full we:cursor-default we:items-center we:gap-2 we:rounded we:border-none we:bg-transparent we:px-2 we:py-2 we:text-left we:text-sm we:outline-none we:select-none we:disabled:pointer-events-none we:disabled:opacity-50',
        destructive && 'we:text-destructive we:focus:bg-destructive/10'
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function TableHandleMenu({
  editor,
  menuOpen,
  onOpenChange,
  children,
}: {
  editor: Editor;
  menuOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const t = useTranslate();
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!menuOpen) return;
    const update = () => setTick((tick) => tick + 1);
    editor.on('transaction', update);
    return () => {
      editor.off('transaction', update);
    };
  }, [editor, menuOpen]);

  const tablePosition = tablePositionFromEditor(editor);
  const headers = tablePosition === null ? { column: false, row: false } : getTableHeaderState(editor, tablePosition);

  const run = useCallback(
    (action: TableActions, close = true) => {
      runTableAction(editor, action);
      if (close) {
        onOpenChange(false);
      }
    },
    [editor, onOpenChange]
  );

  return (
    <Popover modal open={menuOpen} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>{children}</PopoverAnchor>
      <PopoverContent align='start' side='right' className='we:w-56 we:p-2'>
        <p className='we:text-text-light we:px-2 we:pt-1 we:pb-1.5 we:text-xs'>{t('tableBlock')}</p>
        <MenuItem disabled={!canExecuteAction(editor, 'fitToWidth')} onClick={() => run('fitToWidth')}>
          <ArrowLeftRight className='we:size-4' aria-hidden />
          {t('fitToWidth')}
        </MenuItem>
        <MenuItem
          checked={headers.row}
          disabled={!canExecuteAction(editor, 'toggleHeaderRow')}
          onClick={() => run('toggleHeaderRow', false)}
        >
          <ToggleHeaderRowIcon className='we:size-4' aria-hidden />
          <span className='we:flex-1'>{t('headerRow')}</span>
          <MenuSwitch checked={headers.row} />
        </MenuItem>
        <MenuItem
          checked={headers.column}
          disabled={!canExecuteAction(editor, 'toggleHeaderColumn')}
          onClick={() => run('toggleHeaderColumn', false)}
        >
          <ToggleHeaderColIcon className='we:size-4' aria-hidden />
          <span className='we:flex-1'>{t('headerColumn')}</span>
          <MenuSwitch checked={headers.column} />
        </MenuItem>
        <div className='we:bg-border we:my-1 we:h-px' role='separator' />
        <MenuItem disabled={!canExecuteAction(editor, 'addColumnBefore')} onClick={() => run('addColumnBefore')}>
          <AddColumnLeftIcon className='we:size-4' aria-hidden />
          {t('addColumnBefore')}
        </MenuItem>
        <MenuItem disabled={!canExecuteAction(editor, 'addColumnAfter')} onClick={() => run('addColumnAfter')}>
          <AddColumnRightIcon className='we:size-4' aria-hidden />
          {t('addColumnAfter')}
        </MenuItem>
        <MenuItem disabled={!canExecuteAction(editor, 'addRowAfter')} onClick={() => run('addRowAfter')}>
          <AddRowBelowIcon className='we:size-4' aria-hidden />
          {t('addRowAfter')}
        </MenuItem>
        <div className='we:bg-border we:my-1 we:h-px' role='separator' />
        <MenuItem destructive disabled={!canExecuteAction(editor, 'deleteTable')} onClick={() => run('deleteTable')}>
          <Trash2Icon className='we:size-4' aria-hidden />
          {t('deleteTable')}
        </MenuItem>
      </PopoverContent>
    </Popover>
  );
}
