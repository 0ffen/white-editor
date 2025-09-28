import type { Editor } from '@tiptap/react';

type Level = 1 | 2 | 3 | 4 | 5 | 6;

interface HeadingOption {
  label: string;
  level: Level | null;
}

interface UseHeadingDropdownMenuConfig {
  editor?: Editor | null;
  levels?: Level[];
  hideWhenUnavailable?: boolean;
}

export type { Level, HeadingOption, UseHeadingDropdownMenuConfig };
