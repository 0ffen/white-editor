'use client';

/**
 * 에디터/뷰어 extension 빌더가 공유하는 헬퍼와 공통 노드 정의.
 * `editor-extensions.ts`와 `viewer-extensions.ts` 양쪽이 이 모듈을 import하지만,
 * 두 파일의 그래프는 독립적이므로 viewer 청크가 editor 전용 코드를 끌어오지 않는다.
 */

import Paragraph from '@tiptap/extension-paragraph';
import { Node as TipTapNode } from '@tiptap/core';
import { ReactNodeViewRenderer, type Extension } from '@tiptap/react';
import type { OverrideExtensionsConfig, CustomNodeViews } from '../../white-editor/editor/type/white-editor.type';

/** 본문 1, 본문 2를 구분하는 variant 속성을 가진 커스텀 paragraph. */
export const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      variant: {
        default: 1,
        parseHTML: (element) => {
          const variant = element.getAttribute('data-variant');
          return variant ? parseInt(variant, 10) : 1;
        },
        renderHTML: (attributes) => {
          return { 'data-variant': attributes.variant };
        },
      },
    };
  },
});

/**
 * Extension 이름으로 중복을 제거하고 병합. 나중에 추가된 extension이 우선순위를 가진다.
 */
export function mergeExtensions(
  baseExtensions: Extension[],
  customExtensions?: Array<Extension | TipTapNode>
): Extension[] {
  if (!customExtensions || customExtensions.length === 0) {
    return baseExtensions;
  }

  const extensionMap = new Map<string, Extension | TipTapNode>();

  baseExtensions.forEach((ext) => {
    const name = ext.name;
    if (name) {
      extensionMap.set(name, ext);
    }
  });

  customExtensions.forEach((ext) => {
    const name = ext.name;
    if (name) {
      extensionMap.set(name, ext);
    }
  });

  const merged = Array.from(extensionMap.values()) as Extension[];

  const unnamedBase = baseExtensions.filter((ext) => !ext.name);
  const unnamedCustom = customExtensions.filter((ext) => !ext.name) as Extension[];

  return [...merged, ...unnamedBase, ...unnamedCustom];
}

/** Extension 설정을 오버라이드 (`configure` 호출). */
export function overrideExtension(extension: Extension, config: Record<string, unknown>): Extension {
  if (!config || Object.keys(config).length === 0) {
    return extension;
  }
  if (typeof extension.configure === 'function') {
    return extension.configure(config);
  }
  return extension;
}

/** 노드 타입 이름이 customNodeViews에 매핑되어 있으면 React 컴포넌트로 노드 뷰를 적용. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyNodeViews(extension: any, customNodeViews?: CustomNodeViews): any {
  if (!customNodeViews || typeof window === 'undefined') {
    return extension;
  }

  const nodeType = extension.name;
  if (!nodeType || !customNodeViews[nodeType]) {
    return extension;
  }

  const CustomNodeView = customNodeViews[nodeType];

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

/** Extension 배열에 설정 오버라이드와 노드 뷰를 일괄 적용. */
export function processExtensions(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extensions: any[],
  overrideExtensions?: OverrideExtensionsConfig,
  customNodeViews?: CustomNodeViews
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any[] {
  return extensions.map((ext) => {
    let processed = ext;

    if (overrideExtensions && ext.name && overrideExtensions[ext.name]) {
      processed = overrideExtension(processed, overrideExtensions[ext.name]);
    }

    processed = applyNodeViews(processed, customNodeViews);

    return processed;
  });
}
