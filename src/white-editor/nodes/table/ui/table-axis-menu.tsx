import { useEffect, useState, type CSSProperties } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronRight,
  CircleX,
  Copy,
  GripHorizontal,
  GripVertical,
  PaintRoller,
  TableColumnsSplit,
  Trash2,
} from 'lucide-react';
import CellMergeIcon from '@/assets/icons/table/cell-merge.svg?react';
import { useTranslate } from '@/shared';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components';
import { cn } from '@/shared/utils';
import { HIGHLIGHT_COLORS } from '@/white-editor/nodes/highlight/type/highlight.type';
import {
  runTableAxisAction,
  selectTableAxis,
  setTableAxisBackground,
  type TableAxis,
} from '@/white-editor/nodes/table/util/run-table-action';
import type { Editor } from '@tiptap/react';

type AxisMenuItemId =
  | 'color'
  | 'insertBefore'
  | 'insertAfter'
  | 'mergeCells'
  | 'splitCell'
  | 'duplicate'
  | 'clearContents'
  | 'delete';

export function TableAxisMenu({
  axis,
  cellPosition,
  editor,
  emphasized = false,
  isHeaderRow,
  onOpenChange,
  open,
  style,
}: {
  axis: TableAxis;
  cellPosition: number;
  editor: Editor;
  emphasized?: boolean;
  isHeaderRow: boolean;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  style: CSSProperties;
}) {
  const t = useTranslate();
  const [colorOpen, setColorOpen] = useState(false);
  const [canMerge, setCanMerge] = useState(false);
  const [canSplit, setCanSplit] = useState(false);
  const isColumn = axis === 'column';
  const items: { id: AxisMenuItemId; label: string }[] = [
    { id: 'color', label: t('cellColor') },
    { id: 'insertBefore', label: isColumn ? t('addColumnBefore') : t('addRowBefore') },
    { id: 'insertAfter', label: isColumn ? t('addColumnAfter') : t('addRowAfter') },
    { id: 'mergeCells', label: t('mergeCells') },
    { id: 'splitCell', label: t('splitCell') },
    { id: 'duplicate', label: t('duplicate') },
    { id: 'clearContents', label: t('clearContents') },
    { id: 'delete', label: isColumn ? t('deleteColumn') : t('deleteRow') },
  ];

  useEffect(() => {
    if (!open) {
      return;
    }
    const sync = () => {
      setCanMerge(editor.can().mergeCells());
      setCanSplit(editor.can().splitCell());
    };
    sync();
    editor.on('selectionUpdate', sync);
    editor.on('transaction', sync);
    return () => {
      editor.off('selectionUpdate', sync);
      editor.off('transaction', sync);
    };
  }, [editor, open]);

  const run = (action: Exclude<AxisMenuItemId, 'color'>) => {
    runTableAxisAction(editor, action, axis, { cellPosition });
    onOpenChange(false);
    setColorOpen(false);
  };

  const applyColor = (color: string | null) => {
    setTableAxisBackground(editor, axis, color, { cellPosition });
    onOpenChange(false);
    setColorOpen(false);
  };

  return (
    <Popover
      modal
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          selectTableAxis(editor, axis, cellPosition);
        } else {
          setColorOpen(false);
        }
        onOpenChange(nextOpen);
      }}
    >
      <PopoverTrigger asChild>
        <button
          type='button'
          className='we-table-control we-table-axis-control'
          style={style}
          aria-label={isColumn ? t('columnActions') : t('rowActions')}
          title={isColumn ? t('columnActions') : t('rowActions')}
          data-axis={axis}
          data-emphasized={emphasized || open ? 'true' : undefined}
          data-state={open ? 'open' : undefined}
          onMouseDown={(event) => {
            event.preventDefault();
            selectTableAxis(editor, axis, cellPosition);
          }}
        >
          {isColumn ? (
            <GripHorizontal className='we:size-3.5' aria-hidden />
          ) : (
            <GripVertical className='we:size-3.5' aria-hidden />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        side={isColumn ? 'bottom' : 'right'}
        className='we:w-60 we:p-1.5'
        layer='modal'
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className='we:flex we:flex-col'>
          {items.map((item) => {
            if (item.id === 'color') {
              return (
                <div key={item.id} className={cn(colorOpen && 'we:flex we:flex-col we:gap-3')}>
                  <button
                    type='button'
                    className='we:hover:bg-interaction-hover we:focus:bg-interaction-hover we:flex we:w-full we:items-center we:gap-2 we:rounded we:border-none we:bg-transparent we:px-2 we:py-2 we:text-left we:text-sm we:outline-none'
                    onClick={() => setColorOpen((open) => !open)}
                  >
                    <PaintRoller className='we:size-4' aria-hidden />
                    <span className='we:flex-1'>{item.label}</span>
                    <ChevronRight
                      className={cn('we:size-4 we:text-text-light', colorOpen && 'we:rotate-90')}
                      aria-hidden
                    />
                  </button>
                  {colorOpen ? (
                    <div className='we:flex we:flex-nowrap we:justify-between we:px-2 we:pb-1'>
                      <button
                        type='button'
                        className='we:border-border-default we:size-6 we:rounded-full we:border we:bg-transparent'
                        aria-label={t('글자 색상 제거')}
                        onClick={() => applyColor(null)}
                      />
                      {HIGHLIGHT_COLORS.map((color) => (
                        <button
                          key={color.value}
                          type='button'
                          className='we:size-6 we:rounded-full we:border we:border-transparent'
                          style={{ backgroundColor: color.value, borderColor: color.border }}
                          aria-label={color.label}
                          onClick={() => applyColor(color.value)}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            }

            const disabled =
              ((item.id === 'insertBefore' || item.id === 'duplicate' || item.id === 'delete') && isHeaderRow) ||
              (item.id === 'mergeCells' && !canMerge) ||
              (item.id === 'splitCell' && !canSplit);
            return (
              <button
                key={item.id}
                type='button'
                disabled={disabled}
                className={cn(
                  'we:hover:bg-interaction-hover we:focus:bg-interaction-hover we:flex we:w-full we:items-center we:gap-2 we:rounded we:border-none we:bg-transparent we:px-2 we:py-2 we:text-left we:text-sm we:outline-none we:disabled:pointer-events-none we:disabled:opacity-50',
                  item.id === 'delete' && 'we:text-destructive we:hover:bg-destructive/10 we:focus:bg-destructive/10'
                )}
                onClick={() => {
                  if (item.id === 'color') {
                    return;
                  }
                  run(item.id);
                }}
              >
                {item.id === 'insertBefore' ? (
                  isColumn ? (
                    <ArrowLeft className='we:size-4' aria-hidden />
                  ) : (
                    <ArrowUp className='we:size-4' aria-hidden />
                  )
                ) : null}
                {item.id === 'insertAfter' ? (
                  isColumn ? (
                    <ArrowRight className='we:size-4' aria-hidden />
                  ) : (
                    <ArrowDown className='we:size-4' aria-hidden />
                  )
                ) : null}
                {item.id === 'mergeCells' ? <CellMergeIcon className='we:size-4' aria-hidden /> : null}
                {item.id === 'splitCell' ? <TableColumnsSplit className='we:size-4' aria-hidden /> : null}
                {item.id === 'duplicate' ? <Copy className='we:size-4' aria-hidden /> : null}
                {item.id === 'clearContents' ? <CircleX className='we:size-4' aria-hidden /> : null}
                {item.id === 'delete' ? <Trash2 className='we:size-4' aria-hidden /> : null}
                <span className='we:flex-1'>{item.label}</span>
                {item.id === 'duplicate' ? <span className='we:text-text-light we:text-xs'>⌘D</span> : null}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
