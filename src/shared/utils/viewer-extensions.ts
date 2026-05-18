'use client';

/**
 * Viewer 전용 Tiptap extension 빌더.
 * editor-extensions.ts와 ESM 그래프가 분리되어 있어, viewer 청크는 Placeholder/Selection 등
 * 에디터 전용 extension을 끌어오지 않는다.
 */

import React from 'react';
import { all, createLowlight } from 'lowlight';
import { Node, type Node as TipTapNode } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Highlight from '@tiptap/extension-highlight';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import Mathematics, { migrateMathStrings } from '@tiptap/extension-mathematics';
import Mention from '@tiptap/extension-mention';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table, TableCell, TableRow } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { ReactNodeViewRenderer, type Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import { CodeBlock, CustomTableHeader, ResizableImage, createPageLinkExtension } from '@/white-editor/nodes';

import type { OverrideExtensionsConfig, CustomNodeViews } from '../../white-editor/editor/type/white-editor.type';
import { CustomParagraph, mergeExtensions, processExtensions } from './extensions-helpers';

/** 마크다운/HTML 내 `<div>` 블록을 파싱·렌더링 (style, class 유지). 뷰어 전용. */
const BlockDiv = Node.create({
  name: 'blockDiv',
  group: 'block',
  content: 'block+',
  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute('style'),
        renderHTML: (attrs) => (attrs.style ? { style: attrs.style } : {}),
      },
      class: {
        default: null,
        parseHTML: (element) => element.getAttribute('class'),
        renderHTML: (attrs) => (attrs.class ? { class: attrs.class } : {}),
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'div',
        getAttrs: (dom) => {
          if (dom instanceof HTMLElement) {
            return {
              style: dom.getAttribute('style'),
              class: dom.getAttribute('class'),
            };
          }
          return {};
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', HTMLAttributes, 0];
  },
});

// 뷰어 전용 extensions (read-only)
export function createViewerExtensions(
  addExtensions?: Array<Extension>,
  customNodes?: Array<TipTapNode>,
  overrideExtensions?: OverrideExtensionsConfig,
  customNodeViews?: CustomNodeViews
) {
  const allCustomExtensions: Array<Extension | TipTapNode> = [...(addExtensions || []), ...(customNodes || [])];
  const lowlight = createLowlight(all);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseExtensions: any[] = [
    StarterKit.configure({
      codeBlock: false,
      paragraph: false, // Use CustomParagraph instead
      link: {
        openOnClick: true,
        enableClickSelection: false,
      },
    }),
    CustomParagraph,
    BlockDiv,
    Table.configure({
      resizable: false,
      allowTableNodeSelection: false,
    }),
    TableRow,
    CustomTableHeader,
    TableCell,
    TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
    TaskList,
    TaskItem.configure({
      nested: true,
      onReadOnlyChecked: () => false,
    }),
    ResizableImage,
    TextStyleKit,
    Highlight.configure({ multicolor: true }),
    Superscript,
    Subscript,
    CodeBlockLowlight.extend({
      addNodeView() {
        if (typeof window === 'undefined') return null;
        const NodeViewComponent = customNodeViews?.codeBlock || (CodeBlock as React.FC);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return ReactNodeViewRenderer(NodeViewComponent as any);
      },
    }).configure({ lowlight }),
    Mathematics.configure({
      blockOptions: {},
      inlineOptions: {},
    }),
    Mention.configure({
      HTMLAttributes: {
        contenteditable: 'false',
      },
    }),
    // 뷰어에서도 pageMention 노드를 렌더링할 수 있도록 extension 추가 (읽기 전용이므로 빈 배열)
    createPageLinkExtension({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pageLinksData: [] as any,
    }),
  ];

  let processedExtensions = processExtensions(baseExtensions, overrideExtensions, customNodeViews);
  processedExtensions = mergeExtensions(processedExtensions, allCustomExtensions);
  processedExtensions = processExtensions(processedExtensions, overrideExtensions, customNodeViews);

  return processedExtensions;
}

export { migrateMathStrings };
