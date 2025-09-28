import { ToolbarRenderer, type ToolbarItem, type ToolbarItemProps } from '@/editor';
import { createToolbarConfigFromItems } from '../util/toolbar-utils';

interface EditorToolbarProps {
  toolbarItems: ToolbarItem[][];
  toolbarProps?: ToolbarItemProps;
}

export function EditorToolbar(props: EditorToolbarProps) {
  const { toolbarItems, toolbarProps = {} } = props;

  const convertToToolbarConfig = (items: ToolbarItem[][]) => {
    return items.map((group) => createToolbarConfigFromItems(group, toolbarProps));
  };

  const toolbarConfig = convertToToolbarConfig(toolbarItems);
  return <ToolbarRenderer groups={toolbarConfig} />;
}
