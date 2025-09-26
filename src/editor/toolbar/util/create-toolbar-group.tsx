import * as React from 'react';
import {
  BlockquoteButton,
  CodeBlockButton,
  HeadingDropdownMenu,
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
  ImageDialog,
} from '@/editor';
import { ThemeToggle } from '@/shared/components';

/**
 * @name createToolbarGroup
 * @param groupConfig
 * Toolbar 을 만드는 메인 함수
 */
export const createToolbarGroup = (groupConfig: EditorToolbarConfig): React.ReactNode[] => {
  const items: React.ReactNode[] = [];

  /** Undo/Redo */
  if (groupConfig.undo) items.push(<UndoRedoButton key='undo' action='undo' {...groupConfig.undo.props} />);
  if (groupConfig.redo) items.push(<UndoRedoButton key='redo' action='redo' {...groupConfig.redo.props} />);

  /** 헤딩 드롭다운 메뉴 */
  if (groupConfig.heading) {
    items.push(<HeadingDropdownMenu {...groupConfig.heading.props} key='heading' />);
  }

  /** 리스트 */
  if (groupConfig.bulletList) {
    items.push(<ListButton key='bulletList' type={'bulletList'} {...groupConfig.bulletList.props} />);
  }
  if (groupConfig.orderedList) {
    items.push(<ListButton key='orderedList' type={'orderedList'} {...groupConfig.orderedList.props} />);
  }
  if (groupConfig.taskList) {
    items.push(<ListButton key='taskList' type={'taskList'} {...groupConfig.taskList.props} />);
  }

  /** 인용구 */
  if (groupConfig.blockquote) {
    items.push(<BlockquoteButton key='blockquote' {...groupConfig.blockquote.props} />);
  }

  /** 코드 블록 */
  if (groupConfig.codeblock) {
    items.push(<CodeBlockButton key='codeblock' {...groupConfig.codeblock.props} />);
  }

  /** 마크 - Bold, Italic, Strike, Code, Underline, Superscript, Subscript */
  if (groupConfig.bold) {
    items.push(<MarkButton key='bold' type='bold' {...groupConfig.bold.props} />);
  }
  if (groupConfig.italic) {
    items.push(<MarkButton key='italic' type='italic' {...groupConfig.italic.props} />);
  }
  if (groupConfig.strike) {
    items.push(<MarkButton key='strike' type='strike' {...groupConfig.strike.props} />);
  }
  if (groupConfig.code) {
    items.push(<MarkButton key='code' type='code' {...groupConfig.code.props} />);
  }
  if (groupConfig.underline) {
    items.push(<MarkButton key='underline' type='underline' {...groupConfig.underline.props} />);
  }
  if (groupConfig.superscript) {
    items.push(<MarkButton key='superscript' type='superscript' {...groupConfig.superscript.props} />);
  }
  if (groupConfig.subscript) {
    items.push(<MarkButton key='subscript' type='subscript' {...groupConfig.subscript.props} />);
  }

  /** 글씨 색상 */
  if (groupConfig.color) {
    items.push(<ColorPopover key='color' {...groupConfig.color.props} />);
  }

  /** 글씨 하이라이트 */
  if (groupConfig.highlight) {
    items.push(<HighlightPopover key='highlight' {...groupConfig.highlight.props} />);
  }

  /** 링크 */
  if (groupConfig.link) {
    items.push(<LinkPopover key='link' {...groupConfig.link.props} />);
  }

  /** 테이블 */
  if (groupConfig.table) {
    items.push(<TableButton key='table' {...groupConfig.table.props} />);
  }

  /** 수학 공식 */
  if (groupConfig.inlineMath) {
    items.push(<MathPopover key='inlineMath' type='inline' {...groupConfig.inlineMath.props} />);
  }
  if (groupConfig.blockMath) {
    items.push(<MathPopover key='blockMath' type='block' {...groupConfig.blockMath.props} />);
  }

  /** 텍스트 정렬 */
  if (groupConfig.textAlignLeft) {
    items.push(<TextAlignButton key='textAlignLeft' align='left' {...groupConfig.textAlignLeft.props} />);
  }
  if (groupConfig.textAlignCenter) {
    items.push(<TextAlignButton key='textAlignCenter' align='center' {...groupConfig.textAlignCenter.props} />);
  }
  if (groupConfig.textAlignRight) {
    items.push(<TextAlignButton key='textAlignRight' align='right' {...groupConfig.textAlignRight.props} />);
  }
  if (groupConfig.textAlignJustify) {
    items.push(<TextAlignButton key='textAlignJustify' align='justify' {...groupConfig.textAlignJustify.props} />);
  }

  /** 이미지 업로드 */
  if (groupConfig.imageUpload) {
    items.push(<ImageDialog key='image' {...groupConfig.imageUpload.props} />);
  }

  /** 테마 */
  if (groupConfig.theme) {
    items.push(<ThemeToggle key='theme' />);
  }

  return items;
};
