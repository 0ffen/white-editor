import type { RefObject } from 'react';
import type { MentionConfig, EditorExtensions } from '@/white-editor';
import Mention, { type MentionOptions } from '@tiptap/extension-mention';
import unifiedMentionSuggestion from './unified-mention-suggestion';
import type { UnifiedMentionItem } from '../type/mention.type';

interface MentionNodeProps<T, P> {
  mentionDataRef: RefObject<MentionConfig<T> | undefined>;
  pageLinkConfigRef?: RefObject<EditorExtensions<T, P>['pageMention']>;
}

export const MentionNode = <T, P>({ mentionDataRef, pageLinkConfigRef }: MentionNodeProps<T, P>) => {
  const suggestion = unifiedMentionSuggestion<T, P>({
    mentionDataRef,
    pageLinkConfigRef,
  });

  return Mention.extend({
    addKeyboardShortcuts() {
      return {
        ...this.parent?.(),
      };
    },
  }).configure({
    suggestion: {
      ...suggestion,
      items: ({ query, editor }) => {
        const items = suggestion.items?.({ query, editor }) || [];
        return items;
      },
      render: () => {
        const renderConfig = suggestion.render();
        return {
          ...renderConfig,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onStart: (props: any) => {
            // 커스텀 command로 래핑하여 타입에 따라 적절한 노드 생성
            const originalCommand = props.command;
            const customCommand = (item: UnifiedMentionItem) => {
              if (item.type === 'pageMention') {
                // pageMention 노드 생성
                const pageMentionData = item.data;
                const pageMentionConfig = pageLinkConfigRef?.current;
                if (pageMentionConfig && pageMentionData) {
                  const id = String(pageMentionData[pageMentionConfig.id as keyof Record<string, unknown>]);
                  const title = String(pageMentionData[pageMentionConfig.title as keyof Record<string, unknown>]);
                  const href = String(pageMentionData[pageMentionConfig.href as keyof Record<string, unknown>]);

                  // pageMention extension의 노드 생성
                  if (props.range) {
                    const { from, to } = props.range;
                    props.editor
                      .chain()
                      .focus()
                      .deleteRange({ from, to })
                      .insertContent({
                        type: 'pageMention',
                        attrs: {
                          id,
                          label: title,
                          value: href,
                          title,
                          href,
                        },
                      })
                      .run();
                  } else {
                    // range가 없으면 현재 위치에 삽입
                    props.editor
                      .chain()
                      .focus()
                      .insertContent({
                        type: 'pageMention',
                        attrs: {
                          id,
                          label: title,
                          value: href,
                          title,
                          href,
                        },
                      })
                      .run();
                  }
                  return;
                }
              }
              // mention 노드 생성 (기본 동작)
              originalCommand(item);
            };

            renderConfig.onStart({
              ...props,
              command: customCommand,
            });
          },
        };
      },
    } as MentionOptions['suggestion'],
  });
};
