import * as React from 'react';

import { useWhiteEditor, type WhiteEditorProps, defaultToolbarItems } from '@/editor';
import { EditorToolbar } from '@/editor/toolbar/ui/editor-toolbar';
import { Toolbar, TooltipProvider } from '@/shared/components';
import { applyTheme } from '@/shared/utils';
import { cn } from '@/shared/utils';
import { EditorContent, EditorContext } from '@tiptap/react';

export function WhiteEditor<T>(props: WhiteEditorProps<T>) {
  const { extension, toolbarItems, toolbarProps, contentClassName, editorClassName, footer, theme } = props;

  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const { editor } = useWhiteEditor<T>({
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
            className={cn('markdown prose dark:prose-invert max-w-full', contentClassName)}
          />
          {footer && <div className='editor-footer mt-2'>{footer}</div>}
        </EditorContext.Provider>
      </div>
    </TooltipProvider>
  );
}
