'use client';

import { useCallback, useMemo, useRef } from 'react';
import { GripVertical, Plus } from 'lucide-react';
import { useTranslate } from '@/shared';
import { openSlashMenuFromBlock } from '@/white-editor/nodes/slash-command/util/open-slash-menu';
import { offset } from '@floating-ui/dom';
import { DragHandle } from '@tiptap/extension-drag-handle-react';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { Editor } from '@tiptap/react';

export interface BlockDragHandleProps {
  editor: Editor;
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

/**
 * TipTap DragHandle 기반 블록 그립 + Notion-like `+` 버튼.
 */
export function BlockDragHandle({ editor }: BlockDragHandleProps) {
  const t = useTranslate();
  const currentRef = useRef<{ node: ProseMirrorNode | null; pos: number }>({ node: null, pos: -1 });
  const didDragRef = useRef(false);

  const computePositionConfig = useMemo(
    () => ({
      // gutter 안쪽에 붙이고, 블록↔핸들 gap을 최소화
      placement: 'left' as const,
      strategy: 'absolute' as const,
      middleware: [offset({ mainAxis: 2, crossAxis: 0 })],
    }),
    []
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
  }, []);

  const handleGripClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (didDragRef.current) return;

      const { pos } = currentRef.current;
      if (pos < 0 || editor.isDestroyed || !editor.isEditable) return;

      editor.chain().setNodeSelection(pos).focus().run();
    },
    [editor]
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
      editor.commands.unlockDragHandle();
      const related = event.relatedTarget as Node | null;
      // 에디터 본문으로 돌아가는 게 아니면 핸들 숨김
      if (!related || !editor.view.dom.contains(related)) {
        editor.commands.hideDragHandle();
      }
    },
    [editor]
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
        didDragRef.current = true;
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
        <div className='we-drag-handle' aria-label={t('블록 이동')} role='button' onClick={handleGripClick}>
          <GripVertical className='we:size-4' aria-hidden />
        </div>
      </div>
    </DragHandle>
  );
}
