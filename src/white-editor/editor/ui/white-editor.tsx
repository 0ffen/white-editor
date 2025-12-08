import * as React from 'react';
import { useImperativeHandle, forwardRef, useMemo } from 'react';

import { Toolbar, TooltipProvider } from '@/shared/components';
import { applyTheme, cn, normalizeContent } from '@/shared/utils';
import {
  useWhiteEditor,
  type WhiteEditorProps,
  type UseWhiteEditorReturn,
  defaultToolbarItems,
  EditorToolbar,
} from '@/white-editor';
import { EditorContent, EditorContext, type JSONContent } from '@tiptap/react';
import '@/shared/styles/index.css';

export type WhiteEditorRef = UseWhiteEditorReturn;

export const WhiteEditor = forwardRef<WhiteEditorRef, WhiteEditorProps<unknown>>(function WhiteEditor<T = unknown>(
  props: WhiteEditorProps<T>,
  ref: React.Ref<WhiteEditorRef>
) {
  const {
    toolbarItems,
    toolbarProps,
    contentClassName,
    editorClassName,
    footer,
    theme,
    disabled,
    extension,
    showToolbar,
  } = props;

  const toolbarRef = React.useRef<HTMLDivElement>(null);

  // content를 정규화 (text 필드가 숫자인 경우 문자열로 변환)
  const normalizedContent = useMemo(() => {
    if (
      props.content &&
      typeof props.content === 'object' &&
      !Array.isArray(props.content) &&
      'type' in props.content
    ) {
      return normalizeContent(props.content as JSONContent);
    }
    return props.content;
  }, [props.content]);

  const editorHook = useWhiteEditor<T>({
    ...props,
    content: normalizedContent,
  });
  const { editor, charactersCount, focus } = editorHook;

  useImperativeHandle(ref, () => editorHook, [editorHook]);

  /** 에디터 영역 클릭 시 포커스 처리 */
  const handleEditorClick = React.useCallback(
    (event: React.MouseEvent) => {
      if (toolbarRef.current?.contains(event.target as Node)) {
        return;
      }

      if (editor && !disabled) {
        focus();
      }
    },
    [editor, focus, disabled]
  );

  /** 테마 적용 */
  React.useEffect(() => {
    if (theme) {
      applyTheme(theme);
    }
  }, [theme]);

  /** toolbarProps에 extension.imageUpload 병합 */
  const mergedToolbarProps = useMemo(
    () => ({
      ...toolbarProps,
      image: {
        ...toolbarProps?.image,
        ...extension?.imageUpload,
      },
    }),
    [toolbarProps, extension?.imageUpload]
  );

  /** 툴바 렌더링 */
  const renderToolbar = () => {
    if (toolbarItems) {
      return <EditorToolbar toolbarItems={toolbarItems} toolbarProps={mergedToolbarProps} />;
    }
    /** 기본 툴바 */
    return <EditorToolbar toolbarItems={defaultToolbarItems} toolbarProps={mergedToolbarProps} />;
  };

  return (
    <TooltipProvider>
      <div
        className={cn('white-editor', editorClassName, disabled && 'we:opacity-60 we:pointer-events-none')}
        onClick={handleEditorClick}
      >
        <EditorContext.Provider value={{ editor }}>
          {showToolbar && (
            <Toolbar ref={toolbarRef} role='toolbar'>
              <div className={cn('toolbar-wrapper')}>{renderToolbar()}</div>
            </Toolbar>
          )}
          <EditorContent
            editor={editor}
            className={cn(
              'markdown we:prose we:dark:prose-invert we:max-w-full we:flex-1 we:overflow-y-auto',
              contentClassName
            )}
          />
          <div className='we:mt-auto we:flex we:flex-col we:justify-end we:px-2'>
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
});
