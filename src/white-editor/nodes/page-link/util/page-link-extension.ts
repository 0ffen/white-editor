import { Mention } from '@tiptap/extension-mention';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { PageLinkNodeView } from '../ui/page-link-node-view';

// 제네릭 타입으로 실제 데이터 배열을 받음
interface PageLinkExtensionOptions<T = Record<string, unknown>> {
  pageLinksData: T[];
}

export function createPageLinkExtension<T = Record<string, unknown>>({ pageLinksData }: PageLinkExtensionOptions<T>) {
  return Mention.extend({
    name: 'pageMention',
    addAttributes() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parentAttrs = (this as any).parent?.() || {};
      return {
        ...parentAttrs,
        id: {
          default: null,
        },
        label: {
          default: null,
        },
        value: {
          default: null,
        },
      };
    },
    parseHTML() {
      return [
        {
          tag: 'span[data-type="pageMention"]',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          getAttrs: (node: any) => {
            if (typeof node === 'string') return false;
            const element = node as HTMLElement;
            const id = element.getAttribute('data-id');
            const title = element.getAttribute('data-title');
            const href = element.getAttribute('data-href');
            return { id, title, href };
          },
        },
      ];
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderHTML({ node, HTMLAttributes }: any) {
      return [
        'span',
        {
          ...HTMLAttributes,
          'data-type': 'pageMention',
          'data-id': node.attrs.id,
          'data-label': node.attrs.label,
          'data-value': node.attrs.value,
          class: 'mention',
        },
        node.attrs.label || `@${node.attrs.id}`,
      ];
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderText({ node }: any) {
      return node.attrs.label || `@${node.attrs.id}`;
    },
    addInputRules() {
      return [
        {
          find: /(\/(?:pages|page)\/[^\s]+)$/,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          handler: ({ state, range, match }: { state: any; range: any; match: RegExpMatchArray }) => {
            const url = match[1];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const found = pageLinksData.find((item: any) => {
              const itemHref = String(item.href || '');
              return itemHref === url || itemHref.includes(url);
            });
            if (found) {
              const { from, to } = range;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const foundItem = found as any;
              state.tr.replaceWith(
                from,
                to,
                this.type.create({
                  id: String(foundItem.id || ''),
                  title: String(foundItem.title || ''),
                  href: String(foundItem.href || ''),
                })
              );
            }
          },
        },
      ];
    },
    addPasteRules() {
      return [
        {
          find: /(https?:\/\/[^\s]+|\/(?:pages|page)\/[^\s]+)/g,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          handler: ({ state, range, match }: { state: any; range: any; match: RegExpMatchArray }) => {
            const url = match[0];
            // 경로인 경우 pageMention로 변환
            if (url.startsWith('/pages/') || url.startsWith('/page/')) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const found = pageLinksData.find((item: any) => {
                const itemHref = String(item.href || '');
                return itemHref === url || itemHref.includes(url);
              });
              if (found) {
                const { from, to } = range;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const foundItem = found as any;
                state.tr.replaceWith(
                  from,
                  to,
                  this.type.create({
                    id: String(foundItem.id || ''),
                    title: String(foundItem.title || ''),
                    href: String(foundItem.href || ''),
                  })
                );
              }
            }
            // https:// 링크는 일반 링크로 유지 (Link extension이 처리)
          },
        },
      ];
    },
    addNodeView() {
      if (typeof window === 'undefined') {
        return null;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return ReactNodeViewRenderer(PageLinkNodeView as any);
    },
    addOptions() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parentOptions = (this as any).parent?.() || {};
      return {
        ...parentOptions,
        HTMLAttributes: {
          class: 'mention',
        },
        // suggestion은 mention extension에서 통합 처리하므로 비활성화
        // false로 설정하면 TipTap이 suggestion 플러그인을 생성하지 않음
        suggestion: false,
      };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;
}
