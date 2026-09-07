'use client';

import {
  Table2,
  ImageIcon,
  List,
  ListOrdered,
  ListTodo,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Pilcrow,
  TextQuote,
  Code2,
  Minus,
  Link2,
  Sigma,
  SquareSigma,
  Type,
} from 'lucide-react';
import { openSlashImagePicker } from '../util/open-slash-image-picker';
import { openSlashLinkInput, openSlashMathInput } from '../util/open-slash-input';
import type { SlashCommandItem } from '../type/slash-command.type';

export const SLASH_COMMAND_ITEMS: SlashCommandItem[] = [
  // —— 기본 ——
  {
    id: 'table',
    titleKey: '표 추가',
    section: 'basics',
    keywords: ['table', '표', '테이블'],
    icon: Table2,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    },
  },
  {
    id: 'image',
    titleKey: '이미지 추가',
    section: 'basics',
    keywords: ['image', 'img', '이미지', '사진', 'picture'],
    icon: ImageIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      openSlashImagePicker(editor);
    },
  },
  {
    id: 'bulletList',
    titleKey: '기호목록',
    section: 'basics',
    shortcut: '-',
    keywords: ['bullet', 'list', 'ul', '기호', '목록', '불릿'],
    icon: List,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    id: 'orderedList',
    titleKey: '숫자목록',
    section: 'basics',
    shortcut: '1.',
    keywords: ['ordered', 'number', 'ol', '숫자', '목록'],
    icon: ListOrdered,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    id: 'taskList',
    titleKey: '할 일 목록',
    section: 'basics',
    shortcut: '[]',
    keywords: ['todo', 'task', 'checklist', '할일', '체크'],
    icon: ListTodo,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleList('taskList', 'taskItem').run();
    },
  },
  {
    id: 'link',
    titleKey: '링크',
    section: 'basics',
    keywords: ['link', 'url', '링크', '하이퍼링크'],
    icon: Link2,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      requestAnimationFrame(() => openSlashLinkInput(editor));
    },
  },

  // —— 텍스트 ——
  {
    id: 'heading1',
    titleKey: '제목 1',
    section: 'text',
    shortcut: '#',
    keywords: ['h1', 'heading', 'title', '제목'],
    icon: Heading1,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
  {
    id: 'heading2',
    titleKey: '제목 2',
    section: 'text',
    shortcut: '##',
    keywords: ['h2', 'heading', 'title', '제목'],
    icon: Heading2,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
    },
  },
  {
    id: 'heading3',
    titleKey: '제목 3',
    section: 'text',
    shortcut: '###',
    keywords: ['h3', 'heading', 'title', '제목'],
    icon: Heading3,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
    },
  },
  {
    id: 'heading4',
    titleKey: '제목 4',
    section: 'text',
    shortcut: '####',
    keywords: ['h4', 'heading', 'title', '제목'],
    icon: Heading4,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 4 }).run();
    },
  },
  {
    id: 'body1',
    titleKey: '본문 1',
    section: 'text',
    keywords: ['text', 'paragraph', 'body', '본문', '텍스트', '문단'],
    icon: Pilcrow,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('paragraph', { variant: 1 }).run();
    },
  },
  {
    id: 'body2',
    titleKey: '본문 2',
    section: 'text',
    keywords: ['text', 'paragraph', 'body', '본문', '텍스트', '문단'],
    icon: Type,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('paragraph', { variant: 2 }).run();
    },
  },
  {
    id: 'blockquote',
    titleKey: '인용구',
    section: 'text',
    shortcut: '>',
    keywords: ['quote', 'blockquote', '인용'],
    icon: TextQuote,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    id: 'codeBlock',
    titleKey: '코드 블럭',
    section: 'text',
    shortcut: '```',
    keywords: ['code', 'codeblock', '코드', 'mermaid'],
    icon: Code2,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    id: 'horizontalRule',
    titleKey: '구분선',
    section: 'text',
    shortcut: '---',
    keywords: ['divider', 'hr', 'horizontal', '구분선', '가로선'],
    icon: Minus,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },

  // —— 수식 ——
  {
    id: 'inlineMath',
    titleKey: '인라인 수식',
    section: 'math',
    shortcut: '$',
    keywords: ['math', 'latex', 'inline', '수식', '인라인', '수식'],
    icon: Sigma,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      requestAnimationFrame(() => openSlashMathInput(editor, 'inline'));
    },
  },
  {
    id: 'blockMath',
    titleKey: '블록 수식',
    section: 'math',
    shortcut: '$$',
    keywords: ['math', 'latex', 'block', '수식', '블록', '수식'],
    icon: SquareSigma,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      requestAnimationFrame(() => openSlashMathInput(editor, 'block'));
    },
  },
];

export function filterSlashItems(query: string): SlashCommandItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return SLASH_COMMAND_ITEMS;

  return SLASH_COMMAND_ITEMS.filter((item) => {
    const haystack = [item.id, item.titleKey, ...item.keywords].join(' ').toLowerCase();
    return haystack.includes(q);
  });
}
