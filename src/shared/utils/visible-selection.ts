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
              state.selection.jsonID === 'cell' ||
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
          handleDOMEvents: {
            // TipTap NodeView는 드래그 핸들 밖에서 시작한 draggable 노드(이미지 등)의 dragstart를
            // preventDefault만 하고 ProseMirror로 넘긴다. 그대로 두면 ProseMirror가 view.dragging을 채우는데,
            // 취소된 드래그라 dragend/drop이 오지 않아 값이 남고 위 데코레이션이 계속 꺼진다.
            // 취소된 dragstart는 처리된 것으로 돌려 ProseMirror가 드래그를 시작하지 않게 한다.
            dragstart: (_view, event) => event.defaultPrevented,
          },
        },
      }),
    ];
  },
});
