'use client';

import { isEventForEditor } from '@/shared/utils';
import type { MathType } from '@/white-editor/nodes/mathematics/type/math.type';
import type { Editor } from '@tiptap/core';

export const SLASH_OPEN_LINK_EVENT = 'slash-open-link';
export const SLASH_OPEN_MATH_EVENT = 'slash-open-math';

export type SlashOpenLinkDetail = {
  editor: Editor;
};

export type SlashOpenMathDetail = {
  editor: Editor;
  type: MathType;
};

export function isSlashInputEventForEditor(event: Event, editor: Editor): boolean {
  return isEventForEditor(event, editor);
}

export function openSlashLinkInput(editor: Editor) {
  window.dispatchEvent(
    new CustomEvent<SlashOpenLinkDetail>(SLASH_OPEN_LINK_EVENT, {
      detail: { editor },
    })
  );
}

export function openSlashMathInput(editor: Editor, type: MathType) {
  window.dispatchEvent(
    new CustomEvent<SlashOpenMathDetail>(SLASH_OPEN_MATH_EVENT, {
      detail: { editor, type },
    })
  );
}
