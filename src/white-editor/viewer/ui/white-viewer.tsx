import { cn } from '@/shared/utils';
import { createViewerExtensions } from '@/shared/utils';
import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import './viewer.css';

interface WhiteViewerProps {
  content: JSONContent;
  className?: string;
}

export function WhiteViewer({ content, className }: WhiteViewerProps) {
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
