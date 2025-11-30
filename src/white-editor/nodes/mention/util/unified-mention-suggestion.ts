import type { RefObject } from 'react';
import { transformToLabeledItems, updatePosition, type ListItemConfig } from '@/shared/utils';
import {
  UnifiedMentionList,
  type KeyDownProps,
  type MentionConfig,
  type MentionSuggestionConfig,
  type SuggestionProps,
  type UnifiedMentionItem,
  type EditorExtensions,
} from '@/white-editor';
import { ReactRenderer } from '@tiptap/react';

interface UnifiedMentionSuggestionProps<T, P> {
  mentionDataRef: RefObject<MentionConfig<T> | undefined>;
  pageLinkConfigRef?: RefObject<EditorExtensions<T, P>['pageMention']>;
}

const unifiedMentionSuggestion = <T, P>({
  mentionDataRef,
  pageLinkConfigRef,
}: UnifiedMentionSuggestionProps<T, P>): MentionSuggestionConfig => ({
  items: ({ query }) => {
    const results: UnifiedMentionItem[] = [];

    // 사람(mention) 아이템 처리
    const mentionConfig = mentionDataRef.current;
    if (mentionConfig && mentionConfig.data && mentionConfig.id && mentionConfig.label) {
      const configForUtility: ListItemConfig<T> = {
        data: mentionConfig.data,
        mapping: {
          id: mentionConfig.id as keyof T,
          label: mentionConfig.label as keyof T,
        },
      };

      const mentionItems = transformToLabeledItems(configForUtility);
      const filteredMentions = mentionItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));

      filteredMentions.forEach((item) => {
        // 원본 데이터 찾기
        const originalData = mentionConfig.data?.find(
          (d) => String(d[mentionConfig.id as keyof T]) === String(item.id)
        );

        if (originalData) {
          results.push({
            type: 'mention',
            id: String(item.id),
            label: item.label,
            data: originalData,
            renderLabel: mentionConfig.renderLabel ? () => mentionConfig.renderLabel!(originalData as T) : undefined,
          });
        }
      });
    }

    // 페이지 링크 아이템 처리
    const pageLinkConfig = pageLinkConfigRef?.current;
    if (pageLinkConfig && pageLinkConfig.data && pageLinkConfig.id && pageLinkConfig.title) {
      const lowerQuery = query.toLowerCase();

      pageLinkConfig.data.forEach((item) => {
        const id = String(item[pageLinkConfig.id]);
        const title = String(item[pageLinkConfig.title]);
        const href = String(item[pageLinkConfig.href]);
        const path = pageLinkConfig.path ? String(item[pageLinkConfig.path]) : undefined;

        // 검색 쿼리와 일치하는지 확인
        const matchesQuery =
          !query ||
          title.toLowerCase().includes(lowerQuery) ||
          href.toLowerCase().includes(lowerQuery) ||
          (path && path.toLowerCase().includes(lowerQuery));

        if (matchesQuery) {
          results.push({
            type: 'pageMention',
            id,
            label: title,
            path,
            data: item,
            renderLabel: pageLinkConfig.renderLabel ? () => pageLinkConfig.renderLabel!(item) : undefined,
          });
        }
      });
    }

    // UnifiedMentionItem[]을 ListItem[]로 캐스팅 (타입 호환성을 위해)
    return results as unknown as Array<{ id: string; label: string }>;
  },
  render: () => {
    let component: ReactRenderer | null = null;

    return {
      onStart: (props: SuggestionProps) => {
        component = new ReactRenderer(UnifiedMentionList, {
          props: {
            items: props.items as UnifiedMentionItem[],
            command: props.command as (item: UnifiedMentionItem) => void,
          },
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        const element = component.element as HTMLElement;
        element.style.position = 'absolute';

        document.body.appendChild(element);

        updatePosition(props.editor, element);
      },

      onUpdate: (props: SuggestionProps) => {
        if (!component) return;

        component.updateProps({
          items: props.items as UnifiedMentionItem[],
          command: props.command as (item: UnifiedMentionItem) => void,
        });

        if (!props.clientRect) {
          return;
        }

        updatePosition(props.editor, component.element as HTMLElement);
      },

      onKeyDown: (props: KeyDownProps) => {
        if (!component) return false;

        if (props.event.key === 'Escape') {
          component.destroy();
          return true;
        }

        return (component.ref as { onKeyDown: (event: KeyboardEvent) => boolean })?.onKeyDown(props.event) ?? false;
      },

      onExit: () => {
        if (!component) return;

        component.element.remove();
        component.destroy();
        component = null;
      },
    };
  },
});

export default unifiedMentionSuggestion;
