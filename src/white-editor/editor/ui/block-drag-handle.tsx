'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GripVertical, Plus } from 'lucide-react';
import { useTranslate } from '@/shared';
import { openSlashMenuFromBlock } from '@/white-editor/nodes/slash-command/util/open-slash-menu';
import { TableHandleMenu } from '@/white-editor/nodes/table/ui/table-handle-menu';
import { focusFirstTableCell } from '@/white-editor/nodes/table/util/run-table-action';
import { offset } from '@floating-ui/dom';
import { DragHandle } from '@tiptap/extension-drag-handle-react';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { Editor } from '@tiptap/react';

export interface BlockDragHandleProps {
  editor: Editor;
  /**
   * `overlay`일 때 핸들을 콘텐츠 왼쪽 padding 쪽으로 더 붙인다.
   * `reserve`는 확보된 gutter 안에 둔다.
   */
  gutter?: 'reserve' | 'overlay';
}

/** 이 높이(px) 이하면 한 줄로 보고 핸들을 세로 중앙 정렬 */
const CENTER_ALIGN_MAX_HEIGHT = 64;

/** 타입만으로도 상단 고정이 맞는 큰 블록 */
const TOP_ALIGN_NODE_TYPES = new Set([
  'image',
  'table',
  'codeBlock',
  'bulletList',
  'orderedList',
  'taskList',
  'blockquote',
  'horizontalRule',
]);

function shouldAlignTop(node: ProseMirrorNode | null, height: number): boolean {
  if (!node) return false;
  if (TOP_ALIGN_NODE_TYPES.has(node.type.name)) return true;
  return height > CENTER_ALIGN_MAX_HEIGHT;
}

const CLICK_MOVE_THRESHOLD_PX = 4;

function findHoveredTablePos(editor: Editor): number | null {
  if (editor.isDestroyed || !editor.view) return null;

  const { $from } = editor.state.selection;
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if ($from.node(depth).type.name === 'table') {
      return $from.before(depth);
    }
  }

  const node = editor.state.doc.nodeAt(editor.state.selection.from);
  if (node?.type.name === 'table') {
    return editor.state.selection.from;
  }

  return null;
}

/**
 * TipTap DragHandle 기반 블록 그립 + Notion-like `+` 버튼.
 */
export function BlockDragHandle({ editor, gutter = 'reserve' }: BlockDragHandleProps) {
  const t = useTranslate();
  const currentRef = useRef<{ node: ProseMirrorNode | null; pos: number }>({ node: null, pos: -1 });
  const didDragRef = useRef(false);
  const menuOpenRef = useRef(false);
  const pendingClickRef = useRef(false);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const computePositionConfig = useMemo(
    () => ({
      // gutter 안쪽에 붙이고, 블록↔핸들 gap을 최소화
      placement: 'left' as const,
      strategy: 'absolute' as const,
      // overlay: 콘텐츠 바로 왼쪽에 겹침 / reserve: 확보된 gutter 안
      middleware: [offset({ mainAxis: gutter === 'overlay' ? 4 : 2, crossAxis: 0 })],
    }),
    [gutter]
  );

  const getReferencedVirtualElement = useCallback(() => {
    const { node, pos } = currentRef.current;
    if (pos < 0 || !editor.view || editor.isDestroyed) return null;

    const dom = editor.view.nodeDOM(pos);
    if (!(dom instanceof Element)) return null;

    return {
      getBoundingClientRect: () => {
        const rect = dom.getBoundingClientRect();
        if (!shouldAlignTop(node, rect.height)) {
          return rect;
        }

        const slice = 28;
        return {
          width: rect.width,
          height: slice,
          x: rect.x,
          y: rect.y,
          top: rect.y,
          left: rect.x,
          right: rect.right,
          bottom: rect.y + slice,
        };
      },
    };
  }, [editor]);

  const handleNodeChange = useCallback(({ node, pos }: { node: ProseMirrorNode | null; pos: number }) => {
    currentRef.current = { node, pos };
    if (node?.type.name !== 'table' && menuOpenRef.current) {
      setMenuOpen(false);
      menuOpenRef.current = false;
    }
  }, []);

  const handleMenuOpenChange = useCallback(
    (open: boolean) => {
      if (open && didDragRef.current && !pendingClickRef.current) {
        setMenuOpen(false);
        menuOpenRef.current = false;
        return;
      }
      menuOpenRef.current = open;
      setMenuOpen(open);
      if (open) {
        const { pos, node } = currentRef.current;
        if (pos >= 0 && node?.type.name === 'table' && !editor.isDestroyed && editor.isEditable) {
          focusFirstTableCell(editor, pos);
        }
        editor.commands.lockDragHandle();
      } else if (!didDragRef.current) {
        editor.commands.unlockDragHandle();
      }
    },
    [editor]
  );

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      if (!pendingClickRef.current || !pointerStartRef.current) return;
      const dx = event.clientX - pointerStartRef.current.x;
      const dy = event.clientY - pointerStartRef.current.y;
      if (dx * dx + dy * dy > CLICK_MOVE_THRESHOLD_PX * CLICK_MOVE_THRESHOLD_PX) {
        pendingClickRef.current = false;
      }
    };
    const onDragStart = (event: DragEvent) => {
      if (pendingClickRef.current) {
        event.preventDefault();
      }
    };
    window.addEventListener('pointermove', onPointerMove);
    document.addEventListener('dragstart', onDragStart, true);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('dragstart', onDragStart, true);
    };
  }, []);

  const handleGripPointerDown = useCallback((event: React.PointerEvent) => {
    pendingClickRef.current = true;
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
  }, []);

  const handleGripClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (didDragRef.current && !pendingClickRef.current) return;
      pendingClickRef.current = false;
      if (editor.isDestroyed || !editor.isEditable) return;

      const current = currentRef.current;
      const hoveredNode = current.pos >= 0 ? (editor.state.doc.nodeAt(current.pos) ?? current.node) : current.node;
      const tablePos =
        hoveredNode?.type.name === 'table' && current.pos >= 0 ? current.pos : findHoveredTablePos(editor);

      if (hoveredNode && hoveredNode.type.name !== 'table') {
        if (current.pos >= 0) {
          editor.chain().setNodeSelection(current.pos).focus().run();
        }
        return;
      }

      if (tablePos !== null && editor.state.doc.nodeAt(tablePos)?.type.name === 'table') {
        currentRef.current = {
          node: editor.state.doc.nodeAt(tablePos),
          pos: tablePos,
        };
        // 같은 클릭이 Popover dismiss로 바로 닫히지 않게 다음 프레임에 연다.
        window.requestAnimationFrame(() => handleMenuOpenChange(true));
        return;
      }

      if (current.pos < 0) return;
      editor.chain().setNodeSelection(current.pos).focus().run();
    },
    [editor, handleMenuOpenChange]
  );

  const handleAddClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (didDragRef.current) return;

      const { node, pos } = currentRef.current;
      if (pos < 0 || editor.isDestroyed || !editor.isEditable) return;

      openSlashMenuFromBlock(editor, pos, node);
    },
    [editor]
  );

  const stopDragFromControl = useCallback((event: React.MouseEvent | React.PointerEvent) => {
    // + 버튼에서 HTML5 drag가 시작되지 않도록
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleHandleMouseEnter = useCallback(() => {
    // 에디터 mouseleave로 핸들이 사라지지 않도록 lock
    editor.commands.lockDragHandle();
  }, [editor]);

  const handleHandleMouseLeave = useCallback(
    (event: React.MouseEvent) => {
      if (menuOpenRef.current) return;
      editor.commands.unlockDragHandle();
      const related = event.relatedTarget as Node | null;
      // 에디터 본문으로 돌아가는 게 아니면 핸들 숨김
      if (!related || !editor.view.dom.contains(related)) {
        editor.commands.setMeta('hideDragHandle', true);
      }
    },
    [editor]
  );

  const grip = (
    <div
      className='we-drag-handle'
      aria-label={t('블록 이동')}
      role='button'
      onPointerDown={handleGripPointerDown}
      onClick={handleGripClick}
    >
      <GripVertical className='we:size-4' aria-hidden />
    </div>
  );

  return (
    <DragHandle
      editor={editor}
      nested={false}
      className='we-drag-handle-wrapper'
      computePositionConfig={computePositionConfig}
      getReferencedVirtualElement={getReferencedVirtualElement}
      onNodeChange={handleNodeChange}
      onElementDragStart={() => {
        if (pendingClickRef.current) return;
        didDragRef.current = true;
        handleMenuOpenChange(false);
      }}
      onElementDragEnd={() => {
        requestAnimationFrame(() => {
          didDragRef.current = false;
        });
      }}
    >
      <div
        className='we-block-handle-group'
        onMouseEnter={handleHandleMouseEnter}
        onMouseLeave={handleHandleMouseLeave}
      >
        <div
          className='we-block-add-handle'
          aria-label={t('블록 추가')}
          role='button'
          draggable={false}
          onMouseDown={stopDragFromControl}
          onClick={handleAddClick}
        >
          <Plus className='we:size-3.5' aria-hidden />
        </div>
        <TableHandleMenu editor={editor} menuOpen={menuOpen} onOpenChange={handleMenuOpenChange}>
          {grip}
        </TableHandleMenu>
      </div>
    </DragHandle>
  );
}
