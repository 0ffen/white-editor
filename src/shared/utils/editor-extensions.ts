'use client';

/**
 * Editor 전용 Tiptap extension 빌더.
 * viewer-extensions.ts와 ESM 그래프가 분리되어 있어, editor 청크는 자기 의존성만 가진다.
 */

import type { RefObject } from 'react';
import React from 'react';
import { all, createLowlight } from 'lowlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Highlight from '@tiptap/extension-highlight';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import Mathematics from '@tiptap/extension-mathematics';
import Placeholder from '@tiptap/extension-placeholder';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table, TableCell, TableRow } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { Selection, CharacterCount, Dropcursor } from '@tiptap/extensions';
import { ReactNodeViewRenderer, type Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import {
  CodeBlock,
  CustomTableHeader,
  MentionNode,
  ResizableImage,
  type MentionConfig,
  createPageLinkExtension,
} from '@/white-editor/nodes';

import type { OverrideExtensionsConfig, CustomNodeViews } from '../../white-editor/editor/type/white-editor.type';
import { CustomParagraph, mergeExtensions, processExtensions } from './extensions-helpers';

// 에디터 전용 extensions
export function createEditorExtensions<T, P extends Record<string, unknown> = Record<string, unknown>>(
  mentionDataRef?: RefObject<MentionConfig<T> | undefined>,
  pageMentionConfigRef?: RefObject<
    | {
        data: P[];
        id: keyof P;
        title: keyof P;
        href: keyof P;
        path?: keyof P;
        icon?: keyof P;
        renderLabel?: (item: P) => React.ReactNode;
      }
    | undefined
  >,
  maxCharacters?: number,
  extension?: {
    imageUpload?: {
      upload?: (file: File) => Promise<string>;
      onError?: (error: Error) => void;
      onSuccess?: (url: string) => void;
      onImageInserted?: (url: string, caption?: string) => void;
      accept?: string;
      maxSize?: number;
      limit?: number;
    };
    codeBlock?: {
      onCopy?: (code: string) => void;
    };
  },
  placeholder?: string,
  addExtensions?: Array<Extension>,
  customNodes?: Array<import('@tiptap/core').Node>,
  overrideExtensions?: OverrideExtensionsConfig,
  customNodeViews?: CustomNodeViews
) {
  const lowlight = createLowlight(all);

  // addExtensions와 customNodes를 병합 (customNodes가 우선순위를 가짐)
  const allCustomExtensions: Array<Extension | import('@tiptap/core').Node> = [
    ...(addExtensions || []),
    ...(customNodes || []),
  ];

  // addExtensions에 Placeholder가 이미 있는지 확인 (플레이스홀더는 1개만 유지)
  const hasCustomPlaceholder = addExtensions?.some((ext) => ext.name === 'placeholder') ?? false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseExtensions: any[] = [
    StarterKit.configure({
      codeBlock: false,
      paragraph: false, // Use CustomParagraph instead
      dropcursor: false, // 아래에서 단일 Dropcursor로 설정하므로 중복 비활성화
      link: {
        openOnClick: false,
        enableClickSelection: true,
        autolink: true,
      },
    }),
    CustomParagraph,
    CharacterCount.configure({
      limit: maxCharacters || null,
    }),
    Dropcursor.configure({
      color: 'var(--we-brand-light)',
      width: 2,
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    CustomTableHeader,
    TableCell,
    TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
    TaskList,
    TaskItem.configure({ nested: true }),
    ResizableImage.configure({
      extension: extension,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any),
    TextStyleKit,
    Highlight.configure({ multicolor: true }),
    Superscript,
    Subscript,
    Selection,
    CodeBlockLowlight.extend({
      addNodeView() {
        if (typeof window === 'undefined') {
          return null;
        }
        const NodeViewComponent = customNodeViews?.codeBlock || (CodeBlock as React.FC);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return ReactNodeViewRenderer(NodeViewComponent as any);
      },
    }).configure({ lowlight, enableTabIndentation: true }),
    Mathematics.configure({
      blockOptions: {},
      inlineOptions: {},
    }),
    ...(placeholder && !hasCustomPlaceholder
      ? [
          Placeholder.configure({
            placeholder,
            showOnlyWhenEditable: false,
            showOnlyCurrent: true,
          }),
        ]
      : []),
    ...(mentionDataRef && (mentionDataRef.current || pageMentionConfigRef?.current)
      ? [
          MentionNode<T, P>({
            mentionDataRef,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            pageLinkConfigRef: pageMentionConfigRef as any,
          }),
        ]
      : []),
    ...(pageMentionConfigRef?.current?.data
      ? [
          createPageLinkExtension<P>({
            pageLinksData: pageMentionConfigRef.current.data,
          }),
        ]
      : []),
  ];

  let processedExtensions = processExtensions(baseExtensions, overrideExtensions, customNodeViews);
  processedExtensions = mergeExtensions(processedExtensions, allCustomExtensions);
  processedExtensions = processExtensions(processedExtensions, overrideExtensions, customNodeViews);

  return processedExtensions;
}
