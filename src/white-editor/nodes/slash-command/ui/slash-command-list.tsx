'use client';

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useTranslate } from '@/shared';
import { cn } from '@/shared/utils';
import type { SlashCommandItem, SlashSectionId } from '../type/slash-command.type';

const SECTION_ORDER: SlashSectionId[] = ['text', 'basics', 'math'];
const SECTION_LABEL_KEY: Record<SlashSectionId, string> = {
  text: '텍스트',
  basics: '기본',
  math: '수식',
};

export interface SlashCommandListHandle {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

export interface SlashCommandListProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
}

/** `/` 슬래시 메뉴와 `+` 메뉴가 공유하는 패널 크롬 */
export const SLASH_MENU_SURFACE_CLASS =
  'we-slash-menu we:relative we:flex we:max-h-80 we:w-64 we:flex-col we:overflow-y-auto we:py-1.5 we:bg-elevation-dropdown we:shadow-popover we:z-modal we:border-border-default we:rounded-md we:border';

export const SlashCommandList = forwardRef<SlashCommandListHandle, SlashCommandListProps>(function SlashCommandList(
  { items, command },
  ref
) {
  const t = useTranslate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const sections = SECTION_ORDER.map((section) => ({
    section,
    items: items.filter((item) => item.section === section),
  })).filter((group) => group.items.length > 0);

  const flatItems = sections.flatMap((group) => group.items);

  const selectItem = (index: number) => {
    const item = flatItems[index];
    if (item) command(item);
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useEffect(() => {
    if (flatItems.length > 0 && selectedIndex >= flatItems.length) {
      setSelectedIndex(flatItems.length - 1);
    }
  }, [flatItems.length, selectedIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const selectedElement = container.querySelector(`[data-item-index="${selectedIndex}"]`) as HTMLElement | null;
    if (!selectedElement) return;

    // 페이지/에디터까지 스크롤되지 않도록 메뉴 컨테이너 안에서만 맞춤
    const containerRect = container.getBoundingClientRect();
    const itemRect = selectedElement.getBoundingClientRect();
    if (itemRect.bottom > containerRect.bottom) {
      container.scrollTop += itemRect.bottom - containerRect.bottom;
    } else if (itemRect.top < containerRect.top) {
      container.scrollTop -= containerRect.top - itemRect.top;
    }
  }, [selectedIndex]);

  useImperativeHandle(ref, () => ({
    onKeyDown: (event: KeyboardEvent) => {
      if (flatItems.length === 0) return false;
      if (event.key === 'ArrowUp') {
        setSelectedIndex((i) => (i + flatItems.length - 1) % flatItems.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((i) => (i + 1) % flatItems.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  // 메뉴 클릭 시 에디터 blur/selection 유실로 suggestion이 바로 닫히지 않게 함
  const preventEditorBlur = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  if (flatItems.length === 0) {
    return (
      <div ref={containerRef} onMouseDown={preventEditorBlur} className={SLASH_MENU_SURFACE_CLASS}>
        <div className='we:p-4 we:text-center we:text-xs we:text-muted-foreground'>{t('데이터가 없습니다')}</div>
      </div>
    );
  }

  let runningIndex = 0;

  return (
    <div ref={containerRef} onMouseDown={preventEditorBlur} className={SLASH_MENU_SURFACE_CLASS}>
      {sections.map((group) => (
        <div key={group.section} className='we:flex we:flex-col'>
          <div className='we:px-3 we:py-1 we:text-[11px] we:font-medium we:text-muted-foreground'>
            {t(SECTION_LABEL_KEY[group.section])}
          </div>
          <div className='we:flex we:flex-col we:gap-0.5 we:px-1.5 we:pb-1'>
            {group.items.map((item) => {
              const index = runningIndex++;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type='button'
                  data-item-index={index}
                  className={cn(
                    'we:flex we:w-full we:items-center we:gap-2 we:rounded-md we:px-1.5 we:py-1 we:text-left we:transition-colors',
                    selectedIndex === index
                      ? 'we:bg-elevation-level1'
                      : 'we:bg-transparent hover:we:bg-elevation-level1'
                  )}
                  onClick={() => selectItem(index)}
                >
                  <span className='we:flex we:size-6 we:shrink-0 we:items-center we:justify-center we:rounded-md we:border we:border-border-default we:bg-elevation-background we:text-text-sub'>
                    <Icon className='we:size-3' aria-hidden />
                  </span>
                  <span className='we:min-w-0 we:flex-1 we:truncate we:text-xs we:text-text-normal'>
                    {t(item.titleKey)}
                  </span>
                  {item.shortcut ? (
                    <span className='we:shrink-0 we:font-mono we:text-[10px] we:text-muted-foreground'>
                      {item.shortcut}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
});
