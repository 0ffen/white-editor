import React from 'react';
import { getTranslate } from '@/shared';
import { ToolbarButton } from '@/shared/components';
import { useTiptapEditor } from '@/shared/hooks';
import { cn } from '@/shared/utils';
import { canExecuteAction, executeTableAction, useTableToolbar, type TableActionItem } from '@/white-editor';
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
      className={cn('we:[&_svg]:text-foreground/80 we:disabled:[&_svg]:text-text-light')}
      onClick={handleClick}
      disabled={!canExecute}
      ref={ref}
      tooltip={getTranslate(action.action)}
    >
      <div className='we:flex we:h-5 we:w-5 we:items-center we:justify-center'>
        {action.icon && React.createElement(action.icon)}
      </div>
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
    <div className='we:grid we:grid-cols-3 we:gap-1 we:overflow-auto we:md:w-full we:md:grid-rows-3'>
      {options.map((option) => (
        <TableActionButton key={option.action} editor={editor} action={option} />
      ))}
    </div>
  );
};
