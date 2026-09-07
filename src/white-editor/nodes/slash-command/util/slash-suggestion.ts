'use client';

import { getPortalContainer, updatePosition } from '@/shared/utils';
import type { Editor } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import { ReactRenderer } from '@tiptap/react';
import { exitSuggestion, type SuggestionOptions } from '@tiptap/suggestion';
import { filterSlashItems } from '../content/slash-items';
import { SlashCommandList } from '../ui/slash-command-list';
import type { SlashCommandItem } from '../type/slash-command.type';

export const slashCommandPluginKey = new PluginKey('slashCommand');

function destroySlashPopup(component: ReactRenderer | null) {
  if (!component) return;
  component.element.remove();
  component.destroy();
}

export function createSlashSuggestion(): Omit<SuggestionOptions<SlashCommandItem, SlashCommandItem>, 'editor'> {
  return {
    char: '/',
    pluginKey: slashCommandPluginKey,
    allowSpaces: false,
    startOfLine: false,
    allowedPrefixes: [' ', '\u00A0'],
    items: ({ query }) => filterSlashItems(query),
    command: ({ editor, range, props }) => {
      props.command({ editor, range });
    },
    allow: ({ editor, state, range }) => {
      if (!editor.isEditable) return false;
      const $from = state.doc.resolve(range.from);
      if ($from.parent.type.name === 'codeBlock') return false;
      return true;
    },
    render: () => {
      let component: ReactRenderer | null = null;

      return {
        onStart: (props) => {
          // 이전 팝업이 남아 있으면 정리 (moved/changed 또는 stale race 대비)
          destroySlashPopup(component);
          component = null;

          component = new ReactRenderer(SlashCommandList, {
            props: {
              items: props.items,
              command: props.command,
            },
            editor: props.editor as Editor,
          });

          const element = component.element as HTMLElement;
          element.style.position = 'absolute';
          element.style.zIndex = 'var(--we-z-index-floating, 50)';
          getPortalContainer(props.editor as Editor).appendChild(element);

          if (props.clientRect) {
            updatePosition(props.editor as Editor, element);
          }
        },
        onUpdate: (props) => {
          if (!component) return;
          component.updateProps({
            items: props.items,
            command: props.command,
          });
          if (!props.clientRect) return;
          updatePosition(props.editor as Editor, component.element as HTMLElement);
        },
        onKeyDown: (props) => {
          if (!component) return false;
          if (props.event.key === 'Escape') {
            destroySlashPopup(component);
            component = null;
            exitSuggestion(props.editor.view, slashCommandPluginKey);
            return true;
          }
          return (
            (component.ref as { onKeyDown?: (event: KeyboardEvent) => boolean } | null)?.onKeyDown?.(props.event) ??
            false
          );
        },
        onExit: (props) => {
          // Suggestion view.update는 async라 start→stop→start 레이스에서
          // 오래된 onExit가 새 팝업을 지울 수 있음. 플러그인이 다시 active면 유지.
          const editor = props.editor as Editor;
          if (!editor.isDestroyed) {
            const state = slashCommandPluginKey.getState(editor.state) as { active?: boolean } | undefined;
            if (state?.active) return;
          }

          destroySlashPopup(component);
          component = null;
        },
      };
    },
  };
}
