import * as React from 'react';

import { Toolbar, TooltipProvider } from '@/shared/components';
import { applyTheme } from '@/shared/utils';
import { cn } from '@/shared/utils';
import { useWhiteEditor, type WhiteEditorProps, defaultToolbarItems, EditorToolbar } from '@/white-editor';
import { EditorContent, EditorContext } from '@tiptap/react';

export function WhiteEditor<T>(props: WhiteEditorProps<T>) {
  const { extension, toolbarItems, toolbarProps, contentClassName, editorClassName, footer, theme } = props;

  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const { editor, charactersCount } = useWhiteEditor<T>({
    extension,
    contentClassName,
    ...props,
  });

  /** 테마 적용 */
  React.useEffect(() => {
    if (theme) {
      applyTheme(theme);
    }
  }, [theme]);

  /** 툴바 렌더링 */
  const renderToolbar = () => {
    if (toolbarItems) {
      return <EditorToolbar toolbarItems={toolbarItems} toolbarProps={toolbarProps} />;
    }
    /** 기본 툴바 */
    return <EditorToolbar toolbarItems={defaultToolbarItems} toolbarProps={toolbarProps} />;
  };

  return (
    <TooltipProvider>
      <div className={cn('editor-wrapper', editorClassName)}>
        <EditorContext.Provider value={{ editor }}>
          <Toolbar ref={toolbarRef} role='toolbar'>
            <div className={cn('toolbar-wrapper')}>{renderToolbar()}</div>
          </Toolbar>
          <EditorContent
            editor={editor}
            className={cn('markdown prose dark:prose-invert max-w-full flex-1 overflow-y-auto', contentClassName)}
          />
          <div className='mt-auto flex flex-col justify-end gap-2 p-2'>
            {extension?.character?.show && (
              <span className={cn('text-border flex justify-end text-sm select-none', extension?.character?.className)}>
                {charactersCount}
                {extension?.character?.limit && `/${extension.character.limit}`}
              </span>
            )}
            {footer && <>{footer}</>}
          </div>
        </EditorContext.Provider>
      </div>
    </TooltipProvider>
  );
}
