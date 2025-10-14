import type { RefObject } from 'react';
import Mention, { type MentionOptions } from '@tiptap/extension-mention';
import mentionSuggestion from './mention-suggestion';
import type { MentionConfig } from '../type/mention.type';

interface MentionNodeProps<T> {
  mentionDataRef: RefObject<MentionConfig<T> | undefined>;
}

export const MentionNode = <T>({ mentionDataRef }: MentionNodeProps<T>) =>
  Mention.configure({
    suggestion: mentionSuggestion({ mentionDataRef }) as MentionOptions['suggestion'],
  });
