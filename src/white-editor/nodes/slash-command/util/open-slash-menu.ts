'use client';

import type { Editor } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

export const SLASH_OPEN_MENU_EVENT = 'slash-open-menu';

export function openSlashMenu(editor: Editor) {
  window.dispatchEvent(
    new CustomEvent(SLASH_OPEN_MENU_EVENT, {
      detail: { editor },
    })
  );
}

/**
 * `+` 버튼용: 빈 블록이면 그 자리, 아니면 아래 새 문단에 커서를 두고
 * `/` 문자 없이 슬래시 메뉴를 연다.
 */
export function openSlashMenuFromBlock(editor: Editor, blockPos: number, node: ProseMirrorNode | null) {
  if (!node || blockPos < 0 || editor.isDestroyed || !editor.isEditable) return;

  const isEmptyTextblock = node.isTextblock && node.content.size === 0;

  requestAnimationFrame(() => {
    if (editor.isDestroyed || !editor.isEditable) return;

    if (isEmptyTextblock) {
      editor
        .chain()
        .focus()
        .setTextSelection(blockPos + 1)
        .run();
    } else {
      const after = blockPos + node.nodeSize;
      editor
        .chain()
        .focus()
        .insertContentAt(after, { type: 'paragraph' })
        .setTextSelection(after + 1)
        .run();
    }

    openSlashMenu(editor);
  });
}
