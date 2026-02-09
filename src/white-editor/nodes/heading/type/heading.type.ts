import type { Editor } from '@tiptap/react';

type Level = 1 | 2 | 3 | 4 | 5 | 6;

type ParagraphVariant = 1 | 2;

interface HeadingOption {
  label: string;
  level: Level | null;
  paragraphVariant?: ParagraphVariant;
}

interface UseHeadingDropdownMenuConfig {
  editor?: Editor | null;
  levels?: Level[];
  hideWhenUnavailable?: boolean;
}

export type { Level, ParagraphVariant, HeadingOption, UseHeadingDropdownMenuConfig };
