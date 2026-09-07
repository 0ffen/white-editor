'use client';

import { isNodeSelection } from '@tiptap/core';
import { Selection } from '@tiptap/extensions';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

/**
 * TipTap 기본 Selection은 포커스 중엔 데코레이션을 끄고 native ::selection에만 의존한다.
 * contenteditable에서 Ctrl+A 시 ::selection이 거의 안 보이는 경우가 있어,
 * 포커스 중에도 `.selection` 데코레이션을 유지한다.
 */
export const VisibleSelection = Selection.extend({
  addProseMirrorPlugins() {
    const { editor, options } = this;

    return [
      new Plugin({
        key: new PluginKey('visibleSelection'),
        props: {
          decorations(state) {
            if (
              state.selection.empty ||
              !editor.isEditable ||
              isNodeSelection(state.selection) ||
              editor.view.dragging
            ) {
              return null;
            }

            return DecorationSet.create(state.doc, [
              Decoration.inline(state.selection.from, state.selection.to, {
                class: options.className,
              }),
            ]);
          },
        },
      }),
    ];
  },
});
