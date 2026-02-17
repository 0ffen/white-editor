import type { RefObject } from 'react';
import { transformToLabeledItems, updatePosition, getPortalContainer, type ListItemConfig } from '@/shared/utils';
import {
  MentionList,
  type KeyDownProps,
  type MentionConfig,
  type MentionSuggestionConfig,
  type SuggestionProps,
} from '@/white-editor';
import { ReactRenderer } from '@tiptap/react';

interface MentionSuggestionProps<T> {
  mentionDataRef: RefObject<MentionConfig<T> | undefined>;
}
const mentionSuggestion = <T>({ mentionDataRef }: MentionSuggestionProps<T>): MentionSuggestionConfig => ({
  items: ({ query }) => {
    const mentionConfig = mentionDataRef.current;
    if (!mentionConfig || !mentionConfig.data || !mentionConfig.id || !mentionConfig.label) {
      return [];
    }

    const configForUtility: ListItemConfig<T> = {
      data: mentionConfig.data,
      mapping: {
        id: mentionConfig.id as keyof T,
        label: mentionConfig.label as keyof T,
      },
    };

    const items = transformToLabeledItems(configForUtility);

    return items.filter((item) => item.label.toLowerCase().startsWith(query.toLowerCase()));
  },
  render: () => {
    let component: ReactRenderer | null = null;

    return {
      onStart: (props: SuggestionProps) => {
        component = new ReactRenderer(MentionList, {
          props: {
            mentionList: props.items,
            command: props.command,
          },
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        const element = component.element as HTMLElement;
        element.style.position = 'absolute';

        const container = getPortalContainer(props.editor);
        container.appendChild(element);

        updatePosition(props.editor, element);
      },

      onUpdate: (props: SuggestionProps) => {
        if (!component) return;

        component.updateProps({
          mentionList: props.items,
          command: props.command,
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

export default mentionSuggestion;
