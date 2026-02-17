/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { ThemeToggle } from '@/shared/components';
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
  ImageUploadButton,
  type EditorToolbarConfig,
  type ToolbarItem,
} from '@/white-editor';

type ToolbarItemRenderer = (config: Record<string, any>, key: string) => React.ReactNode;

/**
 * 툴바 그룹 생성 함수
 */
export function createToolbarGroup(groupConfig: EditorToolbarConfig, toolbarItems?: ToolbarItem[]): React.ReactNode[] {
  const items: React.ReactNode[] = [];

  if (toolbarItems) {
    toolbarItems.forEach((toolbarItem) => {
      const configKey = TOOLBAR_ITEM_TO_CONFIG_KEY[toolbarItem];
      const itemConfig = groupConfig[configKey];

      if (itemConfig && (typeof itemConfig === 'object' ? itemConfig.show : itemConfig)) {
        const renderer = TOOLBAR_ITEM_REGISTRY[toolbarItem];
        const renderedItem = renderer(itemConfig as EditorToolbarConfig, toolbarItem);
        if (renderedItem) {
          items.push(renderedItem);
        }
      }
    });
  }

  return items;
}

/**
 * @name createToolbarConfigFromItems
 * @description ToolbarItem을 EditorToolbarConfig로 변환
 */
export function createToolbarConfigFromItems(
  toolbarItems: ToolbarItem[],
  toolbarProps: Record<string, any> = {}
): EditorToolbarConfig {
  const config: any = {};

  toolbarItems.forEach((item) => {
    const configKey = TOOLBAR_ITEM_TO_CONFIG_KEY[item];
    const props = toolbarProps[item];

    if (configKey === 'theme') {
      config[configKey] = true;
    } else {
      config[configKey] = {
        show: true,
        props: props,
      };
    }
  });

  return config;
}

/**
 * 툴바 아이템과 해당 렌더링 함수 매핑
 */
const TOOLBAR_ITEM_REGISTRY: Record<ToolbarItem, ToolbarItemRenderer> = {
  // Undo/Redo
  undo: (config, key) => <UndoRedoButton key={key} action='undo' {...config.props} />,
  redo: (config, key) => <UndoRedoButton key={key} action='redo' {...config.props} />,

  // Text Formatting
  bold: (config, key) => <MarkButton key={key} type='bold' {...config.props} />,
  italic: (config, key) => <MarkButton key={key} type='italic' {...config.props} />,
  strike: (config, key) => <MarkButton key={key} type='strike' {...config.props} />,
  underline: (config, key) => <MarkButton key={key} type='underline' {...config.props} />,
  code: (config, key) => <MarkButton key={key} type='code' {...config.props} />,
  superscript: (config, key) => <MarkButton key={key} type='superscript' {...config.props} />,
  subscript: (config, key) => <MarkButton key={key} type='subscript' {...config.props} />,

  // Headings
  heading: (config, key) => <HeadingDropdownMenu key={key} {...config.props} />,

  // Lists
  bulletList: (config, key) => <ListButton key={key} type='bulletList' {...config.props} />,
  orderedList: (config, key) => <ListButton key={key} type='orderedList' {...config.props} />,
  taskList: (config, key) => <ListButton key={key} type='taskList' {...config.props} />,

  // Blocks
  blockquote: (config, key) => <BlockquoteButton key={key} {...config.props} />,
  codeblock: (config, key) => <CodeBlockButton key={key} {...config.props} />,

  // Alignment
  textAlignLeft: (config, key) => <TextAlignButton key={key} align='left' {...config.props} />,
  textAlignCenter: (config, key) => <TextAlignButton key={key} align='center' {...config.props} />,
  textAlignRight: (config, key) => <TextAlignButton key={key} align='right' {...config.props} />,
  textAlignJustify: (config, key) => <TextAlignButton key={key} align='justify' {...config.props} />,

  // Colors & Highlights
  color: (config, key) => <ColorPopover key={key} {...config.props} />,
  highlight: (config, key) => <HighlightPopover key={key} {...config.props} />,

  // Links & Media
  link: (config, key) => <LinkPopover key={key} {...config.props} />,
  table: (config, key) => <TableButton key={key} {...config.props} />,
  image: (config, key) => <ImageUploadButton key={key} {...config.props} />,

  // Math
  inlineMath: (config, key) => <MathPopover key={key} type='inline' {...config.props} />,
  blockMath: (config, key) => <MathPopover key={key} type='block' {...config.props} />,

  // Theme
  theme: (_, key) => <ThemeToggle key={key} />,
};

const TOOLBAR_ITEM_TO_CONFIG_KEY: Record<ToolbarItem, keyof EditorToolbarConfig> = {
  undo: 'undo',
  redo: 'redo',
  heading: 'heading',
  bold: 'bold',
  italic: 'italic',
  strike: 'strike',
  underline: 'underline',
  code: 'code',
  superscript: 'superscript',
  subscript: 'subscript',
  bulletList: 'bulletList',
  orderedList: 'orderedList',
  taskList: 'taskList',
  blockquote: 'blockquote',
  codeblock: 'codeblock',
  color: 'color',
  highlight: 'highlight',
  link: 'link',
  table: 'table',
  image: 'image',
  inlineMath: 'inlineMath',
  blockMath: 'blockMath',
  textAlignLeft: 'textAlignLeft',
  textAlignCenter: 'textAlignCenter',
  textAlignRight: 'textAlignRight',
  textAlignJustify: 'textAlignJustify',
  theme: 'theme',
};
