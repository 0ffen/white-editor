import type { Editor } from '@tiptap/core';

export function isEventForEditor(event: Event, editor: Editor | null | undefined): boolean {
  if (!editor) return false;
  const detail = (event as CustomEvent<{ editor?: Editor }>).detail;
  return !!detail && typeof detail === 'object' && detail.editor === editor;
}
