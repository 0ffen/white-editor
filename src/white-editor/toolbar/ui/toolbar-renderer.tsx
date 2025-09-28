import type React from 'react';
import { ToolbarGroup, ToolbarSeparator } from '@/shared/components';
import { type EditorToolbarConfig } from '@/white-editor';
import { createToolbarGroup } from '../util/toolbar-utils';

interface ToolbarConfig {
  groups?: EditorToolbarConfig[];
}

/**
 * 툴바 렌더러
 * @param config 툴바 설정
 * @returns 툴바 그룹들을 렌더링하는 컴포넌트
 */
export const ToolbarRenderer = (config: ToolbarConfig): React.ReactNode => {
  const result: React.ReactNode[] = [];

  //   그룹 설정
  if (config.groups && config.groups.length > 0) {
    config.groups.forEach((groupConfig, groupIndex) => {
      const groupItems = createToolbarGroup(groupConfig);

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
