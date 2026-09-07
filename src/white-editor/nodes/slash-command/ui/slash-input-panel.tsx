'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { getPortalContainer, sanitizeUrl, updatePosition } from '@/shared/utils';
import { LinkMain } from '@/white-editor/nodes/link/ui/link-main';
import type { MathType } from '@/white-editor/nodes/mathematics/type/math.type';
import { MathPopoverContent } from '@/white-editor/nodes/mathematics/ui/math-popover-content';
import type { Editor } from '@tiptap/core';
import { SLASH_OPEN_LINK_EVENT, SLASH_OPEN_MATH_EVENT, type SlashOpenMathDetail } from '../util/open-slash-input';

type PanelMode = { kind: 'link' } | { kind: 'math'; type: MathType };

export interface SlashInputPanelProps {
  editor: Editor | null;
}

/**
 * 슬래시 메뉴에서 링크/수식 선택 시 커서 근처에 입력 패널을 띄운다.
 */
export function SlashInputPanel({ editor }: SlashInputPanelProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [mode, setMode] = React.useState<PanelMode | null>(null);
  const [url, setUrl] = React.useState<string | null>('');
  const [mathString, setMathString] = React.useState('');
  const [portalRoot, setPortalRoot] = React.useState<HTMLElement | null>(null);

  const close = React.useCallback(() => {
    setMode(null);
    setUrl('');
    setMathString('');
  }, []);

  const reposition = React.useCallback(() => {
    if (!editor || editor.isDestroyed || !panelRef.current) return;
    updatePosition(editor, panelRef.current);
  }, [editor]);

  React.useEffect(() => {
    if (!editor) return;

    const handleOpenLink = () => {
      if (editor.isDestroyed || !editor.isEditable) return;
      setMathString('');
      setUrl('');
      setPortalRoot(getPortalContainer(editor));
      setMode({ kind: 'link' });
    };

    const handleOpenMath = (event: Event) => {
      if (editor.isDestroyed || !editor.isEditable) return;
      const detail = (event as CustomEvent<SlashOpenMathDetail>).detail;
      if (!detail?.type) return;
      setUrl('');
      setMathString('');
      setPortalRoot(getPortalContainer(editor));
      setMode({ kind: 'math', type: detail.type });
    };

    window.addEventListener(SLASH_OPEN_LINK_EVENT, handleOpenLink);
    window.addEventListener(SLASH_OPEN_MATH_EVENT, handleOpenMath);
    return () => {
      window.removeEventListener(SLASH_OPEN_LINK_EVENT, handleOpenLink);
      window.removeEventListener(SLASH_OPEN_MATH_EVENT, handleOpenMath);
    };
  }, [editor]);

  React.useLayoutEffect(() => {
    if (!mode || !editor || editor.isDestroyed) return;

    const element = panelRef.current;
    if (!element) return;

    element.style.position = 'absolute';
    element.style.zIndex = 'var(--we-z-index-floating, 50)';
    reposition();

    const handlePointerDown = (event: MouseEvent) => {
      if (element.contains(event.target as Node)) return;
      close();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        editor.commands.focus();
      }
    };

    // 슬래시 아이템 클릭이 바깥 클릭으로 닫히지 않도록 다음 틱에 등록
    const timer = window.setTimeout(() => {
      document.addEventListener('mousedown', handlePointerDown);
    }, 0);
    document.addEventListener('keydown', handleKeyDown);
    editor.on('selectionUpdate', reposition);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      editor.off('selectionUpdate', reposition);
    };
  }, [mode, editor, close, reposition]);

  const applyLink = React.useCallback(() => {
    if (!editor || editor.isDestroyed) return;
    const trimmed = (url || '').trim();
    if (!trimmed) return;

    const href = sanitizeUrl(trimmed, window.location.href);
    if (!href || href === '#') return;

    editor
      .chain()
      .focus()
      .insertContent({
        type: 'text',
        text: trimmed,
        marks: [{ type: 'link', attrs: { href } }],
      })
      .run();
    close();
  }, [editor, url, close]);

  const removeLink = React.useCallback(() => {
    close();
    editor?.commands.focus();
  }, [close, editor]);

  const applyMath = React.useCallback(() => {
    if (!editor || editor.isDestroyed || !mode || mode.kind !== 'math') return;
    const latex = mathString.trim();
    if (!latex) return;

    if (mode.type === 'block') {
      editor.chain().focus().insertBlockMath({ latex }).run();
    } else {
      editor.chain().focus().insertInlineMath({ latex }).run();
    }
    close();
  }, [editor, mode, mathString, close]);

  const removeMath = React.useCallback(() => {
    close();
    editor?.commands.focus();
  }, [close, editor]);

  const handleMathKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        applyMath();
      }
    },
    [applyMath]
  );

  if (!mode || !portalRoot) return null;

  return createPortal(
    <div
      ref={panelRef}
      className='we-slash-input-panel we:bg-elevation-dropdown we:shadow-popover we:border-border-default we:z-floating we:w-[280px] we:rounded-md we:border we:p-1.5'
      onMouseDown={(event) => event.preventDefault()}
    >
      {mode.kind === 'link' ? (
        <LinkMain url={url || ''} setUrl={setUrl} setLink={applyLink} removeLink={removeLink} isActive={false} />
      ) : (
        <MathPopoverContent
          mathString={mathString}
          setMathString={setMathString}
          isActive={false}
          removeMath={removeMath}
          setMath={applyMath}
          handleKeyDown={handleMathKeyDown}
        />
      )}
    </div>,
    portalRoot
  );
}
