'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { getPortalContainer, attachFloatingToSelection } from '@/shared/utils';
import type { Editor } from '@tiptap/core';
import { SLASH_COMMAND_ITEMS } from '../content/slash-items';
import {
  dismissSlashSuggestion,
  isSlashMenuEventForEditor,
  SLASH_CLOSE_MENU_EVENT,
  SLASH_OPEN_MENU_EVENT,
} from '../util/open-slash-menu';
import { SlashCommandList, type SlashCommandListHandle } from './slash-command-list';
import type { SlashCommandItem } from '../type/slash-command.type';

export interface SlashMenuPanelProps {
  editor: Editor | null;
}

/**
 * `+` 버튼 등으로 `/` 없이 여는 Notion-like 슬래시 메뉴.
 */
export function SlashMenuPanel({ editor }: SlashMenuPanelProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<SlashCommandListHandle>(null);
  const [open, setOpen] = React.useState(false);
  const [portalRoot, setPortalRoot] = React.useState<HTMLElement | null>(null);

  const close = React.useCallback(() => {
    setOpen(false);
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

  React.useEffect(() => {
    if (!editor) return;

    const handleOpen = (event: Event) => {
      // 다른 에디터의 메뉴 오픈이면 내 메뉴는 닫아 중복 방지
      if (!isSlashMenuEventForEditor(event, editor)) {
        close();
        return;
      }
      if (editor.isDestroyed || !editor.isEditable) return;

      dismissSlashSuggestion(editor);
      setPortalRoot(getPortalContainer(editor));
      setOpen(true);
    };

    const handleClose = (event: Event) => {
      if (!isSlashMenuEventForEditor(event, editor)) return;
      close();
    };

    window.addEventListener(SLASH_OPEN_MENU_EVENT, handleOpen);
    window.addEventListener(SLASH_CLOSE_MENU_EVENT, handleClose);
    return () => {
      window.removeEventListener(SLASH_OPEN_MENU_EVENT, handleOpen);
      window.removeEventListener(SLASH_CLOSE_MENU_EVENT, handleClose);
    };
  }, [editor, close]);

  React.useLayoutEffect(() => {
    if (!open || !editor || editor.isDestroyed) return;

    const element = panelRef.current;
    if (!element) return;

    const detachFloating = attachFloatingToSelection(editor, element, { layer: 'modal' });

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
        return;
      }

      if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter') {
        const handled = listRef.current?.onKeyDown(event) ?? false;
        if (handled) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    };

    const timer = window.setTimeout(() => {
      document.addEventListener('mousedown', handlePointerDown);
    }, 0);
    document.addEventListener('keydown', handleWindowKeyDown, true);

    return () => {
      detachFloating();
      window.clearTimeout(timer);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleWindowKeyDown, true);
    };
  }, [open, editor, close]);

  if (!open || !portalRoot) return null;

  return createPortal(
    <div ref={panelRef} className='we-slash-menu-panel' onMouseDown={(event) => event.preventDefault()}>
      <SlashCommandList ref={listRef} items={SLASH_COMMAND_ITEMS} command={runCommand} />
    </div>,
    portalRoot
  );
}
