import type { ListItemConfig } from '@/utils';
import Mention, { type MentionOptions } from '@tiptap/extension-mention';
import mentionSuggestion from './mention-suggestion';

export const MentionNode = <T>(mentionList: ListItemConfig<T>) =>
  Mention.configure({
    suggestion: mentionSuggestion({ mentionList }) as MentionOptions['suggestion'],
  });
