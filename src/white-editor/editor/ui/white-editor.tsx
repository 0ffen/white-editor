import * as React from 'react';
import { useImperativeHandle, forwardRef, useMemo } from 'react';

import { Toolbar, TooltipProvider } from '@/shared/components';
import { ImageUploadContext } from '@/shared/contexts';
import { applyTheme, cn, normalizeContent, removeTheme } from '@/shared/utils';
import { useTranslate, i18n } from '@/shared/utils/i18n';
import {
  useWhiteEditor,
  type WhiteEditorProps,
  type UseWhiteEditorReturn,
  DEFAULT_TOOLBAR_ITEMS,
  EditorToolbar,
  SelectionToolbar,
  LinkFloatingDropdown,
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
    theme,
    contentClassName,
    editorClassName,
    footer,
    disabled,
    extension,
    showToolbar = true,
    showSelectionToolbar = true,
    locale = 'ko',
  } = props;
  const t = useTranslate();

  // locale이 변경되면 즉시 i18n 언어를 동기적으로 설정
  if (i18n.language !== locale) {
    i18n.changeLanguage(locale);
  }

  const containerRefCallback = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !theme) return;
      applyTheme(theme, node);
      return () => {
        removeTheme(node);
      };
    },
    [theme]
  );

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
    placeholder: props.placeholder ?? t('내용을 입력하세요'),
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

  /** 이미지 업로드 설정 (Context로 전달) */
  const imageUploadConfig = useMemo(() => extension?.imageUpload ?? {}, [extension?.imageUpload]);

  /** 툴바 렌더링 */
  const renderToolbar = () => {
    if (toolbarItems) {
      return <EditorToolbar toolbarItems={toolbarItems} toolbarProps={toolbarProps} />;
    }
    /** 기본 툴바 */
    return <EditorToolbar toolbarItems={DEFAULT_TOOLBAR_ITEMS} toolbarProps={toolbarProps} />;
  };

  return (
    <TooltipProvider>
      <div
        ref={containerRefCallback}
        className={cn(
          'white-editor group/editor',
          disabled && 'we:bg-elevation-level1 we:pointer-events-none',
          editorClassName
        )}
        data-disabled={disabled || undefined}
        onClick={handleEditorClick}
      >
        <ImageUploadContext.Provider value={imageUploadConfig}>
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
            {showSelectionToolbar && <SelectionToolbar editor={editor} />}
            <LinkFloatingDropdown editor={editor} />
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
        </ImageUploadContext.Provider>
      </div>
    </TooltipProvider>
  );
});
