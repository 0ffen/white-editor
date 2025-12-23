import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/shared/components';
import { cn } from '@/shared/utils';
import type { UnifiedMentionItem } from '../type/mention.type';

interface UnifiedMentionListProps {
  items: UnifiedMentionItem[];
  command: (item: UnifiedMentionItem) => void;
  ref: React.RefObject<{ onKeyDown: (event: KeyboardEvent) => boolean }>;
  peopleLabel?: string;
  pagesLabel?: string;
  showLabels?: boolean; // 전체 라벨 표시 여부 (하위 옵션보다 우선)
  showPeopleLabel?: boolean; // People 섹션 라벨 표시 여부
  showPagesLabel?: boolean; // Pages 섹션 라벨 표시 여부
}

export const UnifiedMentionList = (props: UnifiedMentionListProps) => {
  const {
    items,
    command,
    ref,
    peopleLabel = 'People',
    pagesLabel = 'Page Link',
    showLabels = true,
    showPeopleLabel = true,
    showPagesLabel = true,
  } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 사람과 페이지 멘션을 섹션으로 구분
  const mentionItems = items.filter((item) => item.type === 'mention');
  const pageMentionItems = items.filter((item) => item.type === 'pageMention');

  // 전체 아이템 배열 (사람 먼저, 페이지 나중)
  const allItems = [...mentionItems, ...pageMentionItems];

  const selectItem = (index: number) => {
    const item = allItems[index];
    if (item) {
      command(item);
    }
  };

  const upHandler = () => {
    if (allItems.length === 0) return;
    setSelectedIndex((selectedIndex + allItems.length - 1) % allItems.length);
  };

  const downHandler = () => {
    if (allItems.length === 0) return;
    setSelectedIndex((selectedIndex + 1) % allItems.length);
  };

  const enterHandler = () => {
    if (allItems.length === 0) return;
    selectItem(selectedIndex);
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  // selectedIndex 변경될 때마다 스크롤 위치를 조정
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 섹션 헤더를 제외한 실제 아이템 요소 찾기
    const itemElements = container.querySelectorAll('[data-item-index]');
    const selectedElement = Array.from(itemElements).find(
      (el) => el.getAttribute('data-item-index') === String(selectedIndex)
    ) as HTMLElement;

    if (selectedElement) {
      selectedElement.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [selectedIndex]);

  useEffect(() => {
    if (allItems.length > 0 && selectedIndex >= allItems.length) {
      setSelectedIndex(allItems.length - 1);
    }
  }, [allItems.length, selectedIndex]);

  const keyDownHandler = (event: KeyboardEvent) => {
    if (event.key === 'ArrowUp') {
      upHandler();
      return true;
    }
    if (event.key === 'ArrowDown') {
      downHandler();
      return true;
    }
    if (event.key === 'Enter') {
      enterHandler();
      return true;
    }
    return false;
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: keyDownHandler,
  }));

  if (allItems.length === 0) {
    return (
      <div
        ref={containerRef}
        style={{
          boxShadow: 'var(--we-popover-shadow)',
        }}
        className='we:bg-popover we:z-10 we:border-border we:relative we:flex we:max-h-52 we:min-w-26 we:flex-col we:overflow-y-auto we:rounded-md'
      >
        <div className='we:p-4 we:text-center we:text-muted-foreground'>No result</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        boxShadow: 'var(--we-popover-shadow)',
      }}
      className='we:bg-popover we:z-10 we:border-border we:relative we:flex we:max-h-52 we:min-w-26 we:flex-col we:overflow-y-auto we:rounded-md'
    >
      {/* 사람 섹션 */}
      {mentionItems.length > 0 && (
        <>
          {showLabels && showPeopleLabel && (
            <div className='we:sticky we:top-0 we:z-10 we:bg-popover we:px-2 we:py-4 we:text-xs we:font-medium we:text-muted-foreground we:uppercase'>
              {peopleLabel}
            </div>
          )}
          <div className='we:flex we:flex-col we:gap-0.5 we:px-1.5 we:py-1.5'>
            {mentionItems.map((item, index) => {
              const globalIndex = index;
              const isSelected = selectedIndex === globalIndex;
              return (
                <Button
                  key={`mention-${item.id}`}
                  type='button'
                  data-item-index={globalIndex}
                  className={cn(
                    'we:justify-start we:gap-2 we:px-2 we:py-1.5 we:h-auto',
                    isSelected ? 'we:bg-accent' : ''
                  )}
                  onClick={() => selectItem(globalIndex)}
                >
                  <div className='we:flex we:min-w-0 we:flex-1 we:flex-col we:gap-0.5'>
                    {item.renderLabel ? (
                      item.renderLabel()
                    ) : (
                      <span className='we:truncate we:text-left we:text-sm'>{item.label}</span>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </>
      )}

      {/* 페이지 멘션 섹션 */}
      {pageMentionItems.length > 0 && (
        <>
          {mentionItems.length > 0 && <div className='we:border-t we:border-border we:my-1' />}
          {showLabels && showPagesLabel && (
            <div className='we:sticky we:top-0 we:z-10 we:bg-popover we:px-2 we:py-1.5 we:text-xs we:font-medium we:text-muted-foreground we:uppercase'>
              {pagesLabel}
            </div>
          )}
          <div className='we:flex we:flex-col we:gap-0.5 we:px-1.5 we:pb-1.5'>
            {pageMentionItems.map((item, index) => {
              const globalIndex = mentionItems.length + index;
              const isSelected = selectedIndex === globalIndex;
              return (
                <Button
                  key={`pagemention-${item.id}`}
                  type='button'
                  data-item-index={globalIndex}
                  className={cn(
                    'we:justify-start we:gap-2 we:px-2 we:py-1.5 we:h-auto',
                    isSelected ? 'we:bg-accent' : ''
                  )}
                  onClick={() => selectItem(globalIndex)}
                >
                  <FileText className='we:h-4 we:w-4 we:shrink-0 we:text-muted-foreground' />
                  <div className='we:flex we:min-w-0 we:flex-1 we:flex-col we:gap-0.5'>
                    {item.renderLabel ? (
                      item.renderLabel()
                    ) : (
                      <>
                        <span className='we:truncate we:text-left we:text-sm'>{item.label}</span>
                        {item.path && (
                          <span className='we:truncate we:text-left we:text-xs we:text-muted-foreground'>
                            {item.path}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
