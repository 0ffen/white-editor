import { generateText, type JSONContent } from '@tiptap/core';
import { createEditorExtensions } from './extensions';

export function getGeneratedText(content: JSONContent) {
  const extention = createEditorExtensions();
  return generateText(content, extention);
}
