'use client';

import type { MathType } from '@/white-editor/nodes/mathematics/type/math.type';
import type { Editor } from '@tiptap/core';

export const SLASH_OPEN_LINK_EVENT = 'slash-open-link';
export const SLASH_OPEN_MATH_EVENT = 'slash-open-math';

export type SlashOpenMathDetail = {
  type: MathType;
};

export function openSlashLinkInput(editor: Editor) {
  window.dispatchEvent(
    new CustomEvent(SLASH_OPEN_LINK_EVENT, {
      detail: { editor },
    })
  );
}

export function openSlashMathInput(editor: Editor, type: MathType) {
  window.dispatchEvent(
    new CustomEvent(SLASH_OPEN_MATH_EVENT, {
      detail: { editor, type } satisfies SlashOpenMathDetail & { editor: Editor },
    })
  );
}
