import type React from 'react';
import { ToolbarGroup, ToolbarSeparator } from '@/components';
import { createToolbarGroup, type EditorToolbarConfig } from '@/editor';

interface ToolbarConfig {
  groups?: EditorToolbarConfig[];
}

/**
 * 커스텀 툴바 생성 함수
 * @param config 툴바 설정
 * @returns 툴바 노드
 * @description ToolbarContainer는 툴바 그룹 설정을 받아서 툴바 그룹을 생성하는 함수입니다.
 */
export const ToolbarContainer = (config: ToolbarConfig): React.ReactNode => {
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
