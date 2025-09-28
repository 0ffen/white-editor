import { cn } from '@/shared/utils';
import { createViewerExtensions } from '@/shared/utils/extensions';
import './editor-viewer.css';
import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';

interface EditorViewerProps {
  content: JSONContent;
  className?: string;
}

export function EditorViewer({ content, className }: EditorViewerProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: createViewerExtensions(),
    content,
  });

  return (
    <div className={cn('markdown prose dark:prose-invert readonly max-w-full', className)}>
      <EditorContent editor={editor} />
    </div>
  );
}
