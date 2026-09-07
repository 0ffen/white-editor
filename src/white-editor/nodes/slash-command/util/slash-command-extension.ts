'use client';

import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { createSlashSuggestion } from './slash-suggestion';

/**
 * `/` 입력 시 Notion-like 슬래시 커맨드 메뉴를 연다.
 */
export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: createSlashSuggestion(),
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
