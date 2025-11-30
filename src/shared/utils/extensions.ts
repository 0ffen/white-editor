import type { RefObject } from 'react';
import React from 'react';
import { all, createLowlight } from 'lowlight';
import { MentionNode, CodeBlock, ResizableImage, CustomTableHeader, type MentionConfig } from '@/white-editor';

export interface ResizableImageOptions {
  extension?: EditorExtensions<Record<string, unknown>> | null;
}

import type { Node as TipTapNode } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Highlight from '@tiptap/extension-highlight';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import Mathematics, { migrateMathStrings } from '@tiptap/extension-mathematics';
import Mention from '@tiptap/extension-mention';
import Placeholder from '@tiptap/extension-placeholder';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table, TableCell, TableRow } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { Selection, CharacterCount } from '@tiptap/extensions';
import { ReactNodeViewRenderer, type Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type {
  EditorExtensions,
  OverrideExtensionsConfig,
  CustomNodeViews,
} from '../../white-editor/editor/type/white-editor.type';

/**
 * Extension 이름으로 중복을 제거하고 병합합니다.
 * 나중에 추가된 extension이 우선순위를 가집니다.
 *
 * @param baseExtensions - 기본 extensions 배열
 * @param customExtensions - 커스텀 extensions 또는 노드 배열
 * @returns 병합된 extensions 배열
 */
function mergeExtensions(baseExtensions: Extension[], customExtensions?: Array<Extension | TipTapNode>): Extension[] {
  if (!customExtensions || customExtensions.length === 0) {
    return baseExtensions;
  }

  // Extension 이름을 키로 하는 Map 생성
  const extensionMap = new Map<string, Extension | TipTapNode>();

  // 기본 extensions 먼저 추가
  baseExtensions.forEach((ext) => {
    const name = ext.name;
    if (name) {
      extensionMap.set(name, ext);
    }
  });

  // 커스텀 extensions 추가 (기존 것과 이름이 같으면 덮어씀)
  customExtensions.forEach((ext) => {
    const name = ext.name;
    if (name) {
      extensionMap.set(name, ext);
    }
  });

  // Map의 값들을 배열로 변환 (Extension 타입으로 캐스팅)
  const merged = Array.from(extensionMap.values()) as Extension[];

  // 이름이 없는 extensions는 커스텀 extensions에서만 추가
  const unnamedBase = baseExtensions.filter((ext) => !ext.name);
  const unnamedCustom = customExtensions.filter((ext) => !ext.name) as Extension[];

  return [...merged, ...unnamedBase, ...unnamedCustom];
}

/**
 * Extension 설정을 오버라이드합니다.
 *
 * @param extension - 오버라이드할 extension
 * @param config - 오버라이드할 설정 객체
 * @returns 설정이 적용된 extension
 */
function overrideExtension(extension: Extension, config: Record<string, unknown>): Extension {
  if (!config || Object.keys(config).length === 0) {
    return extension;
  }

  // Extension이 configure 메서드를 가지고 있으면 사용
  if (typeof extension.configure === 'function') {
    return extension.configure(config);
  }

  // configure 메서드가 없으면 그대로 반환
  return extension;
}

/**
 * 노드 뷰 컴포넌트를 적용합니다.
 *
 * @param extension - 노드 뷰를 적용할 extension
 * @param customNodeViews - 노드 타입별 React 컴포넌트 매핑
 * @returns 노드 뷰가 적용된 extension
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyNodeViews(extension: any, customNodeViews?: CustomNodeViews): any {
  if (!customNodeViews || typeof window === 'undefined') {
    return extension;
  }

  const nodeType = extension.name;
  if (!nodeType || !customNodeViews[nodeType]) {
    return extension;
  }

  const CustomNodeView = customNodeViews[nodeType];

  // Extension이 extend 메서드를 가지고 있고 addNodeView를 지원하는 경우
  if (typeof extension.extend === 'function') {
    return extension.extend({
      addNodeView() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return ReactNodeViewRenderer(CustomNodeView as any);
      },
    });
  }

  return extension;
}

/**
 * Extension 배열에 설정 오버라이드와 노드 뷰를 적용합니다.
 *
 * @param extensions - 처리할 extensions 배열
 * @param overrideExtensions - extension별 설정 오버라이드
 * @param customNodeViews - 노드 뷰 컴포넌트 매핑
 * @returns 처리된 extensions 배열
 */
function processExtensions(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extensions: any[],
  overrideExtensions?: OverrideExtensionsConfig,
  customNodeViews?: CustomNodeViews
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any[] {
  return extensions.map((ext) => {
    let processed = ext;

    // Extension 설정 오버라이드
    if (overrideExtensions && ext.name && overrideExtensions[ext.name]) {
      processed = overrideExtension(processed, overrideExtensions[ext.name]);
    }

    // 노드 뷰 적용
    processed = applyNodeViews(processed, customNodeViews);

    return processed;
  });
}

// 에디터 전용 extensions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createEditorExtensions<T, P = any>(
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
    };
  },
  placeholder?: string,
  addExtensions?: Array<Extension>,
  customNodes?: Array<TipTapNode>,
  overrideExtensions?: OverrideExtensionsConfig,
  customNodeViews?: CustomNodeViews
) {
  const lowlight = createLowlight(all);

  // addExtensions와 customNodes를 병합 (customNodes가 우선순위를 가짐)
  // addExtensions는 외부 extension 전용, customNodes는 커스텀 노드 전용
  const allCustomExtensions: Array<Extension | TipTapNode> = [...(addExtensions || []), ...(customNodes || [])];

  // addExtensions에 Placeholder가 이미 있는지 확인 (플레이스홀더는 1개만 유지)
  const hasCustomPlaceholder = addExtensions?.some((ext) => ext.name === 'placeholder') ?? false;

  // 기본 extensions 생성
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseExtensions: any[] = [
    StarterKit.configure({
      codeBlock: false,
      link: {
        openOnClick: false,
        enableClickSelection: true,
        autolink: true,
      },
    }),
    CharacterCount.configure({
      limit: maxCharacters || null,
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
        // customNodeViews에 codeBlock이 있으면 사용, 없으면 기본 CodeBlock 사용
        const NodeViewComponent = customNodeViews?.codeBlock || (CodeBlock as React.FC);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return ReactNodeViewRenderer(NodeViewComponent as any);
      },
    }).configure({ lowlight, enableTabIndentation: true }),
    Mathematics.configure({
      blockOptions: {},
      inlineOptions: {},
    }),
    // placeholder prop이 있고 customExtensions에 Placeholder가 없을 때만 추가
    ...(placeholder && !hasCustomPlaceholder
      ? [
          Placeholder.configure({
            placeholder,
            showOnlyWhenEditable: false,
            showOnlyCurrent: true,
          }),
        ]
      : []),
    ...(mentionDataRef ? [MentionNode({ mentionDataRef, pageLinkConfigRef: pageMentionConfigRef })] : []),
  ];

  // Extension 설정 오버라이드 및 노드 뷰 적용
  let processedExtensions = processExtensions(baseExtensions, overrideExtensions, customNodeViews);

  // 커스텀 extensions 및 nodes 병합
  processedExtensions = mergeExtensions(processedExtensions, allCustomExtensions);

  // 병합된 extensions에도 설정 오버라이드 및 노드 뷰 적용
  processedExtensions = processExtensions(processedExtensions, overrideExtensions, customNodeViews);

  return processedExtensions;
}

// 뷰어 전용 extensions (read-only)
export function createViewerExtensions(
  addExtensions?: Array<Extension>,
  customNodes?: Array<TipTapNode>,
  overrideExtensions?: OverrideExtensionsConfig,
  customNodeViews?: CustomNodeViews
) {
  // addExtensions와 customNodes를 병합
  const allCustomExtensions: Array<Extension | TipTapNode> = [...(addExtensions || []), ...(customNodes || [])];
  const lowlight = createLowlight(all);

  // 기본 extensions 생성
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseExtensions: any[] = [
    StarterKit.configure({
      codeBlock: false,
      link: {
        openOnClick: true,
        enableClickSelection: false,
      },
    }),
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
      readonly: true,
      addNodeView() {
        if (typeof window === 'undefined') return null;
        // customNodeViews에 codeBlock이 있으면 사용, 없으면 기본 CodeBlock 사용
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
  ];

  // Extension 설정 오버라이드 및 노드 뷰 적용
  let processedExtensions = processExtensions(baseExtensions, overrideExtensions, customNodeViews);

  // 커스텀 extensions 및 nodes 병합
  processedExtensions = mergeExtensions(processedExtensions, allCustomExtensions);

  // 병합된 extensions에도 설정 오버라이드 및 노드 뷰 적용
  processedExtensions = processExtensions(processedExtensions, overrideExtensions, customNodeViews);

  return processedExtensions;
}

// Math migration
export { migrateMathStrings };
