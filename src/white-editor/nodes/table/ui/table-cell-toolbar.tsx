import { useCallback, useEffect, useRef, useState } from 'react';
import { CircleX, PaintRoller, TableColumnsSplit } from 'lucide-react';
import CellMergeIcon from '@/assets/icons/table/cell-merge.svg?react';
import { useTranslate } from '@/shared';
import { FloatingToolbar, Popover, PopoverContent, PopoverTrigger, ToolbarButton } from '@/shared/components';
import { cn } from '@/shared/utils';
import { HIGHLIGHT_COLORS } from '@/white-editor/nodes/highlight/type/highlight.type';
import {
  clearSelectedCellContents,
  getCellSelectionRect,
  isTableCellRangeSelection,
  runTableAction,
  setSelectedCellBackground,
} from '@/white-editor/nodes/table/util/run-table-action';
import type { Editor } from '@tiptap/react';

const SHOW_DELAY_MS = 120;
const FADE_DURATION_MS = 200;

export function TableCellToolbar({ editor }: { editor: Editor | null }) {
  const t = useTranslate();
  const [isVisible, setIsVisible] = useState(false);
  const [isFadedIn, setIsFadedIn] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [canMerge, setCanMerge] = useState(false);
  const [canSplit, setCanSplit] = useState(false);
  const showDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getAnchorRect = useCallback(() => (editor ? getCellSelectionRect(editor) : null), [editor]);

  useEffect(() => {
    if (!isVisible) {
      setIsFadedIn(false);
      setColorOpen(false);
      return;
    }
    const id = requestAnimationFrame(() => setIsFadedIn(true));
    return () => cancelAnimationFrame(id);
  }, [isVisible]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    const sync = () => {
      if (showDelayTimerRef.current) {
        clearTimeout(showDelayTimerRef.current);
        showDelayTimerRef.current = null;
      }
      if (!editor.isEditable || !isTableCellRangeSelection(editor) || !getCellSelectionRect(editor)) {
        setIsVisible(false);
        return;
      }
      setCanMerge(editor.can().mergeCells());
      setCanSplit(editor.can().splitCell());
      showDelayTimerRef.current = setTimeout(() => {
        showDelayTimerRef.current = null;
        if (!editor.isDestroyed && editor.isEditable && isTableCellRangeSelection(editor)) {
          setCanMerge(editor.can().mergeCells());
          setCanSplit(editor.can().splitCell());
          setIsVisible(true);
        }
      }, SHOW_DELAY_MS);
    };
    editor.on('selectionUpdate', sync);
    editor.on('transaction', sync);
    sync();
    return () => {
      editor.off('selectionUpdate', sync);
      editor.off('transaction', sync);
      if (showDelayTimerRef.current) {
        clearTimeout(showDelayTimerRef.current);
      }
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <FloatingToolbar
      isOpen={isVisible}
      getAnchorRect={getAnchorRect}
      placement='top'
      offset={{ y: 8 }}
      className='we-table-cell-toolbar'
      style={{
        opacity: isFadedIn ? 1 : 0,
        transition: `opacity ${FADE_DURATION_MS}ms ease-out`,
      }}
      onMouseDown={(event) => event.preventDefault()}
    >
      {canMerge ? (
        <ToolbarButton
          tooltip={t('mergeCells')}
          aria-label={t('mergeCells')}
          onClick={() => runTableAction(editor, 'mergeCells')}
        >
          <CellMergeIcon className='we:size-4' />
        </ToolbarButton>
      ) : null}
      {canSplit ? (
        <ToolbarButton
          tooltip={t('splitCell')}
          aria-label={t('splitCell')}
          onClick={() => runTableAction(editor, 'splitCell')}
        >
          <TableColumnsSplit className='we:size-4' />
        </ToolbarButton>
      ) : null}
      <Popover open={colorOpen} onOpenChange={setColorOpen}>
        <PopoverTrigger asChild>
          <ToolbarButton tooltip={t('cellColor')} aria-label={t('cellColor')} isActive={colorOpen}>
            <PaintRoller className='we:size-4' />
          </ToolbarButton>
        </PopoverTrigger>
        <PopoverContent
          align='center'
          side='top'
          className='we:w-auto we:p-2'
          layer='modal'
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <div className='we:flex we:items-center we:gap-2'>
            <button
              type='button'
              className='we:border-border-default we:size-6 we:rounded-full we:border we:bg-transparent'
              aria-label={t('글자 색상 제거')}
              onClick={() => {
                setSelectedCellBackground(editor, null);
                setColorOpen(false);
              }}
            />
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color.value}
                type='button'
                className='we:size-6 we:rounded-full we:border we:border-transparent'
                style={{ backgroundColor: color.value, borderColor: color.border }}
                aria-label={color.label}
                onClick={() => {
                  setSelectedCellBackground(editor, color.value);
                  setColorOpen(false);
                }}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <ToolbarButton
        tooltip={t('clearContents')}
        aria-label={t('clearContents')}
        className={cn('we:text-text-normal')}
        onClick={() => clearSelectedCellContents(editor)}
      >
        <CircleX className='we:size-4' />
      </ToolbarButton>
    </FloatingToolbar>
  );
}
