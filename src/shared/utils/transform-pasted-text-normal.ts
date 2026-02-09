'use client';

import { Fragment, type Node, Slice } from '@tiptap/pm/model';
import type { EditorView } from '@tiptap/pm/view';

const DEFAULT_TEXT_COLOR = 'var(--we-text-normal)';

/**
 * 복붙된 slice 내 모든 textStyle 마크를 기본 색상(var(--we-text-normal))으로 고정합니다.
 * ProseMirror editorProps.transformPasted에 넣어 사용합니다.
 */
export function transformPastedToTextNormal(slice: Slice, view: EditorView): Slice {
  const schema = view.state.schema;
  const textStyleType = schema.marks?.textStyle;
  if (!textStyleType) return slice;

  const defaultTextStyle = textStyleType.create({ color: DEFAULT_TEXT_COLOR });

  function transformNode(node: Node): Node {
    let newMarks = node.marks;
    const hasTextStyle = node.marks.some((m) => m.type === textStyleType);
    if (hasTextStyle) {
      newMarks = node.marks.filter((m) => m.type !== textStyleType).concat(defaultTextStyle);
    }
    if (node.content.size > 0) {
      const newContent = transformFragment(node.content);
      return node.type.create(node.attrs, newContent, newMarks);
    }
    return newMarks.length > 0 ? node.mark(newMarks) : node;
  }

  function transformFragment(frag: Fragment): Fragment {
    const nodes: Node[] = [];
    frag.forEach((node) => nodes.push(transformNode(node)));
    return Fragment.from(nodes);
  }

  const newContent = transformFragment(slice.content);
  return new Slice(newContent, slice.openStart, slice.openEnd);
}
