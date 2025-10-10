import React, { useMemo, useEffect } from 'react';
import { cn, createViewerExtensions } from '@/shared/utils';
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
    editorProps: {
      attributes: {
        spellcheck: 'false',
        contenteditable: 'false',
      },
    },
  });

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [editor, content]);

  return (
    <div className={cn('white-editor viewer', className)}>
      <EditorContent
        editor={editor}
        className={cn('readonly we:prose we:dark:prose-invert we:max-w-full we:h-full markdown', className)}
      />
    </div>
  );
});
