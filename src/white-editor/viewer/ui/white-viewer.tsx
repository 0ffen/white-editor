import React, { useMemo, useEffect, useRef } from 'react';
import { cn, normalizeContentSchema } from '@/shared/utils';
import { createViewerExtensions } from '@/shared/utils/extensions';
import type { ExtensibleEditorConfig } from '@/white-editor';
import { EditorContent, useEditor, type JSONContent } from '@tiptap/react';

import '@/shared/styles/viewer.css';

const EMPTY_DOC: JSONContent = { type: 'doc', content: [] };

export interface WhiteViewerProps extends ExtensibleEditorConfig {
  /** JSONContent 또는 { content: JSONContent, html?: string } 등 래퍼 형태. 내부에서 정규화합니다. */
  content: unknown;
  className?: string;
  footer?: React.ReactNode;
}

export const WhiteViewer = React.memo(function WhiteViewer(props: WhiteViewerProps) {
  const { content, className, footer, addExtensions, customNodes, overrideExtensions, customNodeViews } = props;

  const extensions = useMemo(
    () => createViewerExtensions(addExtensions, customNodes, overrideExtensions, customNodeViews),
    [addExtensions, customNodes, overrideExtensions, customNodeViews]
  );

  const normalizedContent = useMemo(() => {
    try {
      return normalizeContentSchema(content);
    } catch (error) {
      console.warn('Failed to normalize content schema, using fallback:', error);
      return EMPTY_DOC;
    }
  }, [content]);

  const contentRef = useRef<JSONContent>(normalizedContent);

  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions,
    content: normalizedContent || { type: 'doc', content: [] },
    editorProps: {
      attributes: {
        spellcheck: 'false',
        contenteditable: 'false',
      },
    },
  });

  useEffect(() => {
    if (editor && normalizedContent) {
      // content가 실제로 변경되었는지 확인
      const currentContent = editor.getJSON();
      const contentString = JSON.stringify(normalizedContent);
      const currentContentString = JSON.stringify(currentContent);

      if (contentString !== currentContentString) {
        contentRef.current = normalizedContent;
        // flushSync 경고를 피하기 위해 비동기로 처리
        queueMicrotask(() => {
          editor.commands.setContent(normalizedContent, { emitUpdate: false });
        });
      }
    }
  }, [editor, normalizedContent]);

  return (
    <div className={cn('white-editor viewer', className)}>
      <EditorContent
        editor={editor}
        className={cn('readonly we:prose we:dark:prose-invert we:max-w-full we:h-full markdown', className)}
      />
      {footer && <>{footer}</>}
    </div>
  );
});
