import { ToolbarRenderer, type ToolbarItem, type ToolbarItemProps, createToolbarConfigFromItems } from '@/white-editor';

interface EditorToolbarProps {
  toolbarItems: ToolbarItem[][];
  toolbarProps?: ToolbarItemProps;
}

export function EditorToolbar(props: EditorToolbarProps) {
  const { toolbarItems, toolbarProps = {} } = props;

  const convertToToolbarConfig = (items: ToolbarItem[][]) => {
    return items.map((group) => ({
      config: createToolbarConfigFromItems(group, toolbarProps),
      items: group,
    }));
  };

  const toolbarConfigWithItems = convertToToolbarConfig(toolbarItems);
  return <ToolbarRenderer groups={toolbarConfigWithItems} />;
}
