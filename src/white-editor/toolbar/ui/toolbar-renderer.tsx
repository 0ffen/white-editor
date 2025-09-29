import type React from 'react';
import { ToolbarGroup, ToolbarSeparator } from '@/shared/components';
import { type EditorToolbarConfig, type ToolbarItem, createToolbarGroup } from '@/white-editor';

interface ToolbarGroupWithItems {
  config: EditorToolbarConfig;
  items: ToolbarItem[];
}

interface ToolbarConfig {
  groups?: (EditorToolbarConfig | ToolbarGroupWithItems)[];
}

/**
 * 툴바 렌더러
 * @param config 툴바 설정
 * @returns 툴바 그룹들을 렌더링하는 컴포넌트
 */
export const ToolbarRenderer = (config: ToolbarConfig): React.ReactNode => {
  const result: React.ReactNode[] = [];

  if (config.groups && config.groups.length > 0) {
    config.groups.forEach((groupConfig, groupIndex) => {
      let groupItems: React.ReactNode[];

      if ('config' in groupConfig && 'items' in groupConfig) {
        const groupWithItems = groupConfig as ToolbarGroupWithItems;
        groupItems = createToolbarGroup(groupWithItems.config, groupWithItems.items);
      } else {
        groupItems = createToolbarGroup(groupConfig as EditorToolbarConfig);
      }

      if (groupItems.length > 0) {
        result.push(<ToolbarGroup key={`group-${groupIndex}`}>{groupItems}</ToolbarGroup>);

        if (groupIndex < config.groups!.length - 1) {
          result.push(<ToolbarSeparator key={`separator-${groupIndex}`} />);
        }
      }
    });
  }

  return <>{result}</>;
};
