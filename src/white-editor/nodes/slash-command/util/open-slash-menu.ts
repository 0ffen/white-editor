'use client';

import type { Editor } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { exitSuggestion } from '@tiptap/suggestion';
import { slashCommandPluginKey } from './slash-suggestion';

export const SLASH_OPEN_MENU_EVENT = 'we-slash-open-menu';
export const SLASH_CLOSE_MENU_EVENT = 'we-slash-close-menu';

export type SlashMenuEventDetail = {
  editor: Editor;
};

function isSameEditor(detail: unknown, editor: Editor): detail is SlashMenuEventDetail {
  return !!detail && typeof detail === 'object' && (detail as SlashMenuEventDetail).editor === editor;
}

export function isSlashMenuEventForEditor(event: Event, editor: Editor): boolean {
  return isSameEditor((event as CustomEvent<SlashMenuEventDetail>).detail, editor);
}

/** `/` suggestion 팝업이 있으면 닫는다. */
export function dismissSlashSuggestion(editor: Editor) {
  if (editor.isDestroyed) return;
  try {
    exitSuggestion(editor.view, slashCommandPluginKey);
  } catch {
    // suggestion 미활성 시 무시
  }
}

export function openSlashMenu(editor: Editor) {
  dismissSlashSuggestion(editor);
  window.dispatchEvent(
    new CustomEvent<SlashMenuEventDetail>(SLASH_OPEN_MENU_EVENT, {
      detail: { editor },
    })
  );
}

export function closeSlashMenu(editor: Editor) {
  window.dispatchEvent(
    new CustomEvent<SlashMenuEventDetail>(SLASH_CLOSE_MENU_EVENT, {
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
