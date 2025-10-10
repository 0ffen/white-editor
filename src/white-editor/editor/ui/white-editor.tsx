import * as React from 'react';

import { Toolbar, TooltipProvider } from '@/shared/components';
import { applyTheme, cn } from '@/shared/utils';
import { useWhiteEditor, type WhiteEditorProps, defaultToolbarItems, EditorToolbar } from '@/white-editor';
import { EditorContent, EditorContext } from '@tiptap/react';
import '@/shared/styles/index.css';

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
      <div className={cn('white-editor', editorClassName)}>
        <EditorContext.Provider value={{ editor }}>
          <Toolbar ref={toolbarRef} role='toolbar'>
            <div className={cn('toolbar-wrapper')}>{renderToolbar()}</div>
          </Toolbar>
          <EditorContent
            editor={editor}
            className={cn(
              'markdown we:prose we:dark:prose-invert we:max-w-full we:flex-1 we:overflow-y-auto',
              contentClassName
            )}
          />
          <div className='we:mt-auto we:flex we:flex-col we:justify-end we:gap-2 we:p-2'>
            {extension?.character?.show && (
              <span
                className={cn(
                  'we:text-border we:text-sm we:flex we:justify-end we:select-none',
                  extension?.character?.className
                )}
              >
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
