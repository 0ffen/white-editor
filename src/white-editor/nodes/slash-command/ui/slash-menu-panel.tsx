'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useTranslate } from '@/shared';
import { getPortalContainer, updatePosition } from '@/shared/utils';
import type { Editor } from '@tiptap/core';
import { filterSlashItems } from '../content/slash-items';
import { SLASH_OPEN_MENU_EVENT } from '../util/open-slash-menu';
import { SlashCommandList, type SlashCommandListHandle } from './slash-command-list';
import type { SlashCommandItem } from '../type/slash-command.type';

export interface SlashMenuPanelProps {
  editor: Editor | null;
}

/**
 * `+` 버튼 등으로 `/` 없이 여는 Notion-like 슬래시 메뉴.
 * 필터는 메뉴 안 검색 입력으로만 받아 한글 IME/에디터 입력을 건드리지 않는다.
 */
export function SlashMenuPanel({ editor }: SlashMenuPanelProps) {
  const t = useTranslate();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<SlashCommandListHandle>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [portalRoot, setPortalRoot] = React.useState<HTMLElement | null>(null);

  const items = filterSlashItems(query);

  const close = React.useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  const runCommand = React.useCallback(
    (item: SlashCommandItem) => {
      if (!editor || editor.isDestroyed) return;
      const pos = editor.state.selection.from;
      close();
      item.command({ editor, range: { from: pos, to: pos } });
    },
    [editor, close]
  );

  const reposition = React.useCallback(() => {
    if (!editor || editor.isDestroyed || !panelRef.current) return;
    updatePosition(editor, panelRef.current);
  }, [editor]);

  React.useEffect(() => {
    if (!editor) return;

    const handleOpen = () => {
      if (editor.isDestroyed || !editor.isEditable) return;
      setQuery('');
      setPortalRoot(getPortalContainer(editor));
      setOpen(true);
    };

    window.addEventListener(SLASH_OPEN_MENU_EVENT, handleOpen);
    return () => window.removeEventListener(SLASH_OPEN_MENU_EVENT, handleOpen);
  }, [editor]);

  React.useLayoutEffect(() => {
    if (!open || !editor || editor.isDestroyed) return;

    const element = panelRef.current;
    if (!element) return;

    element.style.position = 'absolute';
    element.style.zIndex = 'var(--we-z-index-floating, 50)';
    reposition();

    // 메뉴 검색창에 포커스해 에디터/IME 충돌 방지
    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    const handlePointerDown = (event: MouseEvent) => {
      if (element.contains(event.target as Node)) return;
      close();
    };

    const handleWindowKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close();
        editor.commands.focus();
      }
    };

    const timer = window.setTimeout(() => {
      document.addEventListener('mousedown', handlePointerDown);
    }, 0);
    document.addEventListener('keydown', handleWindowKeyDown, true);
    editor.on('selectionUpdate', reposition);

    return () => {
      window.clearTimeout(focusTimer);
      window.clearTimeout(timer);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleWindowKeyDown, true);
      editor.off('selectionUpdate', reposition);
    };
  }, [open, editor, close, reposition]);

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter') {
      const handled = listRef.current?.onKeyDown(event.nativeEvent) ?? false;
      if (handled) {
        event.preventDefault();
      }
    }
  };

  if (!open || !portalRoot) return null;

  return createPortal(
    <div
      ref={panelRef}
      className='we-slash-menu-panel we:bg-elevation-dropdown we:shadow-popover we:border-border-default we:z-floating we:flex we:w-64 we:flex-col we:overflow-hidden we:rounded-md we:border'
      onMouseDown={(event) => {
        // 검색 input 포커스는 유지, 바깥으로 blur만 막음
        if (event.target !== inputRef.current) {
          event.preventDefault();
        }
      }}
    >
      <div className='we:border-border-default we:border-b we:px-2 we:py-1.5'>
        <input
          ref={inputRef}
          type='text'
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder={t('검색')}
          className='we:text-text-normal we:placeholder:text-muted-foreground we:w-full we:border-0 we:bg-transparent we:text-xs we:outline-none'
          autoComplete='off'
          autoCorrect='off'
          autoCapitalize='off'
          spellCheck={false}
        />
      </div>
      <SlashCommandList ref={listRef} items={items} command={runCommand} bare />
    </div>,
    portalRoot
  );
}
