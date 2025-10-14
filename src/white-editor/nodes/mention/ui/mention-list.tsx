// ✨ 1. useRef를 import합니다.
import React, { useEffect, useImperativeHandle, useState, useRef } from 'react';
import { Button } from '@/shared/components';
import { cn } from '@/shared/utils';

interface MentionItem {
  label: string;
  id: string;
}

interface MentionListProps {
  mentionList: MentionItem[];
  command: (item: MentionItem) => void;
  ref: React.RefObject<{ onKeyDown: (event: KeyboardEvent) => boolean }>;
}

export const MentionList = (props: MentionListProps) => {
  const { mentionList, command, ref } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);

  // ✨ 2. 스크롤을 제어할 div에 대한 ref를 생성합니다.
  const containerRef = useRef<HTMLDivElement>(null);

  const selectItem = (index: number) => {
    const item = mentionList[index];
    if (item) {
      command(item);
    }
  };

  const upHandler = () => {
    if (mentionList.length === 0) return;
    setSelectedIndex((selectedIndex + mentionList.length - 1) % mentionList.length);
  };

  const downHandler = () => {
    if (mentionList.length === 0) return;
    setSelectedIndex((selectedIndex + 1) % mentionList.length);
  };

  const enterHandler = () => {
    if (mentionList.length === 0) return;
    selectItem(selectedIndex);
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [mentionList]);

  //selectedIndex 변경될 때마다 스크롤 위치를 조정
  useEffect(() => {
    const container = containerRef.current;
    const selectedItem = container?.children[selectedIndex] as HTMLElement;

    if (selectedItem) {
      selectedItem.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [selectedIndex]);

  useEffect(() => {
    if (mentionList.length > 0 && selectedIndex >= mentionList.length) {
      setSelectedIndex(mentionList.length - 1);
    }
  }, [mentionList.length, selectedIndex]);

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

  return (
    <div
      ref={containerRef}
      style={{
        boxShadow: 'var(--we-popover-shadow)',
      }}
      className='we:bg-popover we:z-10 we:border-border we:relative we:flex we:max-h-52 we:min-w-26 we:flex-col we:gap-1 we:overflow-y-auto we:rounded-md we:p-1.5'
    >
      {mentionList.length > 0 ? (
        mentionList.map((item: MentionItem, index) => (
          <Button
            type='button'
            className={cn(index === selectedIndex ? 'we:bg-accent' : '')}
            key={item.id}
            justify='start'
            onClick={() => selectItem(index)}
          >
            {item.label}
          </Button>
        ))
      ) : (
        <div className='we:p-4 we:text-center'>No result</div>
      )}
    </div>
  );
};
