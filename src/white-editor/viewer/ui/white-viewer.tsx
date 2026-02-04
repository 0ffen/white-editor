import React, { useMemo, useEffect, useRef } from 'react';
import { cn, createViewerExtensions, normalizeContent } from '@/shared/utils';
import type { ExtensibleEditorConfig } from '@/white-editor';
import { EditorContent, useEditor, type JSONContent } from '@tiptap/react';

import '@/shared/styles/viewer.css';

export interface WhiteViewerProps extends ExtensibleEditorConfig {
  content: JSONContent;
  className?: string;
  footer?: React.ReactNode;
}

export const WhiteViewer = React.memo(function WhiteViewer(props: WhiteViewerProps) {
  const { content, className, footer, addExtensions, customNodes, overrideExtensions, customNodeViews } = props;

  const extensions = useMemo(
    () => createViewerExtensions(addExtensions, customNodes, overrideExtensions, customNodeViews),
    [addExtensions, customNodes, overrideExtensions, customNodeViews]
  );

  // content를 정규화 (text 필드가 숫자인 경우 문자열로 변환)
  const normalizedContent = useMemo(() => normalizeContent(content), [content]);
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
