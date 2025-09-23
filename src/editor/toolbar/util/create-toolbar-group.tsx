import * as React from 'react';
import {
  BlockquoteButton,
  CodeBlockButton,
  HeadingDropdownMenu,
  ImageUploadButton,
  LinkPopover,
  ListButton,
  MarkButton,
  TextAlignButton,
  UndoRedoButton,
  ColorPopover,
  HighlightPopover,
  MathPopover,
  TableButton,
  type EditorToolbarConfig,
} from '@/editor';
import { ThemeToggle } from '@/shared/components';

export const createToolbarGroup = (groupConfig: EditorToolbarConfig): React.ReactNode[] => {
  const items: React.ReactNode[] = [];

  /** Undo/Redo */
  if (groupConfig.undo) items.push(<UndoRedoButton key='undo' action='undo' />);
  if (groupConfig.redo) items.push(<UndoRedoButton key='redo' action='redo' />);

  /** 헤딩 드롭다운 메뉴 */
  if (groupConfig.heading) {
    items.push(<HeadingDropdownMenu key='heading' options={groupConfig.heading.options} />);
  }

  /** 리스트 */
  if (groupConfig.list) {
    groupConfig.list.forEach((type) => {
      items.push(<ListButton key={type} type={type} />);
    });
  }

  /** 인용구 */
  if (groupConfig.blockquote) {
    items.push(<BlockquoteButton key='blockquote' />);
  }

  /** 코드 블록 */
  if (groupConfig.codeblock) {
    items.push(<CodeBlockButton key='codeblock' />);
  }

  /** 마크 - Bold, Italic, Strike, Code, Underline, Superscript, Subscript */
  if (groupConfig.marks) {
    groupConfig.marks.forEach((type) => {
      items.push(<MarkButton key={type} type={type} />);
    });
  }

  /** 글씨 색상 */
  if (groupConfig.color) {
    items.push(<ColorPopover key='color' />);
  }

  /** 글씨 하이라이트 */
  if (groupConfig.highlight) {
    items.push(<HighlightPopover key='highlight' />);
  }

  /** 링크 */
  if (groupConfig.link) {
    items.push(<LinkPopover key='link' />);
  }

  /** 테이블 */
  if (groupConfig.table) {
    items.push(<TableButton key='table' />);
  }

  /** 수식 */
  if (groupConfig.math && groupConfig.math.length > 0) {
    groupConfig.math.forEach((type) => {
      items.push(<MathPopover key={type} type={type} />);
    });
  }

  /** 텍스트 정렬 */
  if (groupConfig.textAlign && groupConfig.textAlign.length > 0) {
    groupConfig.textAlign.forEach((align) => {
      items.push(<TextAlignButton key={align} align={align} />);
    });
  }

  /** 이미지 업로드 */
  if (groupConfig.imageUpload) {
    items.push(<ImageUploadButton key='image' />);
  }

  /** 테마 */
  if (groupConfig.theme) {
    items.push(<ThemeToggle key='theme' />);
  }

  return items;
};
