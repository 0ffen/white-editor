import React, { useMemo, useEffect } from 'react';
import { cn } from '@/shared/utils';
import { createViewerExtensions } from '@/shared/utils';
import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import './viewer.css';

export interface WhiteViewerProps {
  content: JSONContent;
  className?: string;
}

export const WhiteViewer = React.memo(function WhiteViewer(props: WhiteViewerProps) {
  const { content, className } = props;

  const extensions = useMemo(() => createViewerExtensions(), []);

  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions,
    content,
    shouldRerenderOnTransaction: false,
  });

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [editor, content]);

  return (
    <div className={cn('white-editor markdown prose dark:prose-invert readonly max-w-full', className)}>
      <EditorContent editor={editor} />
    </div>
  );
});
