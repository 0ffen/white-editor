import React, { useEffect, useImperativeHandle, useState } from 'react';
import { Button } from '@/components';
import { cn } from '@/utils';

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

  const selectItem = (index: number) => {
    const item = mentionList[index];

    if (item) {
      command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + mentionList.length - 1) % mentionList.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % mentionList.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [mentionList]);

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
      style={{
        boxShadow: 'var(--popover-shadow)',
      }}
      className='bg-popover border-border relative flex max-h-52 min-w-26 flex-col gap-1 overflow-y-auto rounded-md p-1.5'
    >
      {mentionList.length > 0 ? (
        mentionList.map((item: MentionItem, index) => (
          <Button
            type='button'
            className={cn(index === selectedIndex ? 'bg-accent' : '')}
            key={item.id}
            justify='start'
            onClick={() => selectItem(index)}
          >
            {item.label}
          </Button>
        ))
      ) : (
        <div className='p-4 text-center'>No result</div>
      )}
    </div>
  );
};
