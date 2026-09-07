'use client';

import { attachFloatingToSelection, getPortalContainer } from '@/shared/utils';
import type { Editor } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import { ReactRenderer } from '@tiptap/react';
import { exitSuggestion, type SuggestionOptions } from '@tiptap/suggestion';
import { filterSlashItems } from '../content/slash-items';
import { SlashCommandList } from '../ui/slash-command-list';
import { closeSlashMenu } from './open-slash-menu';
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
      let detachFloating: (() => void) | null = null;
      let activeEditor: Editor | null = null;

      return {
        onStart: (props) => {
          // + 버튼 메뉴와 동시에 뜨지 않도록 닫기
          activeEditor = props.editor as Editor;
          closeSlashMenu(activeEditor);

          detachFloating?.();
          detachFloating = null;
          destroySlashPopup(component);
          component = null;

          component = new ReactRenderer(SlashCommandList, {
            props: {
              items: props.items,
              command: props.command,
            },
            editor: activeEditor,
          });

          const element = component.element as HTMLElement;
          getPortalContainer(activeEditor).appendChild(element);

          if (props.clientRect) {
            detachFloating = attachFloatingToSelection(activeEditor, element);
          }
        },
        onUpdate: (props) => {
          if (!component) return;
          component.updateProps({
            items: props.items,
            command: props.command,
          });
          // selection 변경 시 autoUpdate가 따라가므로 별도 위치 갱신 불필요
        },
        onKeyDown: (props) => {
          if (!component) return false;
          if (props.event.key === 'Escape') {
            detachFloating?.();
            detachFloating = null;
            destroySlashPopup(component);
            component = null;
            if (activeEditor && !activeEditor.isDestroyed) {
              exitSuggestion(activeEditor.view, slashCommandPluginKey);
            }
            return true;
          }
          return (
            (component.ref as { onKeyDown?: (event: KeyboardEvent) => boolean } | null)?.onKeyDown?.(props.event) ??
            false
          );
        },
        onExit: (props) => {
          const editor = props.editor as Editor;
          if (!editor.isDestroyed) {
            const state = slashCommandPluginKey.getState(editor.state) as { active?: boolean } | undefined;
            if (state?.active) return;
          }

          detachFloating?.();
          detachFloating = null;
          destroySlashPopup(component);
          component = null;
          activeEditor = null;
        },
      };
    },
  };
}
