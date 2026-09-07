'use client';

import { useCallback, useMemo, useRef } from 'react';
import { GripVertical } from 'lucide-react';
import { useTranslate } from '@/shared';
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
 * TipTap DragHandle 기반 블록 재정렬 그립.
 * - 한 줄: 세로 중앙 / 큰 블록(표·이미지 등): 상단
 * - 클릭 시 해당 블록 NodeSelection (Notion-like)
 */
export function BlockDragHandle({ editor }: BlockDragHandleProps) {
  const t = useTranslate();
  const currentRef = useRef<{ node: ProseMirrorNode | null; pos: number }>({ node: null, pos: -1 });
  const didDragRef = useRef(false);

  const computePositionConfig = useMemo(
    () => ({
      placement: 'left' as const,
      strategy: 'absolute' as const,
      middleware: [offset(4)],
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

        // placement: left(중앙) + 상단 슬라이스 → 큰 블록에서 핸들이 상단에 고정
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

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      // 드래그 직후 브라우저가 보내는 click는 무시
      if (didDragRef.current) return;

      const { pos } = currentRef.current;
      if (pos < 0 || editor.isDestroyed || !editor.isEditable) return;

      editor.chain().setNodeSelection(pos).run();
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
        // click가 dragend 뒤에 올 수 있어 한 틱 뒤에 리셋
        requestAnimationFrame(() => {
          didDragRef.current = false;
        });
      }}
    >
      <div className='we-drag-handle' aria-label={t('블록 이동')} role='button' onClick={handleClick}>
        <GripVertical className='we:size-4' aria-hidden />
      </div>
    </DragHandle>
  );
}
