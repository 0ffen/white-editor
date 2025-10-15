import { generateText, type JSONContent } from '@tiptap/core';
import { createViewerExtensions } from './extensions';

export function getGeneratedText(content: JSONContent) {
  const extention = createViewerExtensions();
  return generateText(content, extention);
}
