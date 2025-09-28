import { transformToLabeledItems, updatePosition, type ListItemConfig } from '@/shared/utils';
import { MentionList, type KeyDownProps, type MentionSuggestionConfig, type SuggestionProps } from '@/white-editor';
import { ReactRenderer } from '@tiptap/react';

const mentionSuggestion = <T>({ mentionList }: { mentionList: ListItemConfig<T> }): MentionSuggestionConfig => ({
  items: () => transformToLabeledItems(mentionList),
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

        document.body.appendChild(element);

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
