import React from 'react';
import { ToolbarButton } from '@/shared/components';
import { canExecuteAction, executeTableAction, useTableToolbar, type TableActionItem } from '@/editor';
import { useTiptapEditor } from '@/shared/hooks';
import { cn } from '@/shared/utils';
import type { Editor } from '@tiptap/react';

const TableActionButton = React.forwardRef<
  HTMLButtonElement,
  {
    editor: Editor | null;
    action: TableActionItem;
  }
>(({ editor, action }, ref) => {
  const canExecute = canExecuteAction(editor, action.action);

  const handleClick = React.useCallback(() => {
    if (editor && canExecute) {
      executeTableAction(editor, action.action);
    }
  }, [editor, action.action, canExecute]);

  return (
    <ToolbarButton
      className={cn('[&_svg]:text-foreground/80')}
      onClick={handleClick}
      disabled={!canExecute}
      ref={ref}
      tooltip={action.label}
    >
      <div className='flex h-5 w-5 items-center justify-center'>{action.icon && React.createElement(action.icon)}</div>
    </ToolbarButton>
  );
});

TableActionButton.displayName = 'TableActionButton';

export const TableToolbar = ({
  editor: providedEditor,
  options,
  hideWhenUnavailable,
}: {
  editor: Editor | null;
  options: TableActionItem[];
  hideWhenUnavailable: boolean;
  className?: string;
}) => {
  const { editor } = useTiptapEditor(providedEditor);
  const { isVisible } = useTableToolbar({
    editor,
    actions: options,
    hideWhenUnavailable,
  });

  if (!isVisible) {
    return null;
  }

  return (
    <div className='grid grid-cols-3 gap-1 overflow-auto md:w-full md:grid-rows-3'>
      {options.map((option) => (
        <TableActionButton key={option.action} editor={editor} action={option} />
      ))}
    </div>
  );
};
