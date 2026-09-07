'use client';

import type { Editor, Range } from '@tiptap/core';
import type { LucideIcon } from 'lucide-react';

export type SlashSectionId = 'basics' | 'text' | 'math';

export interface SlashCommandItem {
  id: string;
  /** useTranslate 한글 키 */
  titleKey: string;
  section: SlashSectionId;
  /** 메뉴 우측 마크다운 힌트 */
  shortcut?: string;
  keywords: string[];
  icon: LucideIcon;
  command: (props: { editor: Editor; range: Range }) => void;
}
