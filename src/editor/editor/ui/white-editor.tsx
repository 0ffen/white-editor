import * as React from 'react';

import { defaultToolbar, useWhiteEditor, type WhiteEditorProps } from '@/editor';
import { Toolbar } from '@/shared/components';

import { cn } from '@/shared/utils';
import { EditorContent, EditorContext } from '@tiptap/react';

export function WhiteEditor<T>(props: WhiteEditorProps<T>) {
  const { mentionItems, toolbar, contentClassName, editorClassName, imageConfig } = props;

  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const { editor } = useWhiteEditor<T>({ mentionItems, contentClassName, imageConfig });

  // const editorConfig:  = {
  //   extensions: [
  //     ImageUploadNode.configure({
  //       accept: 'image/*',
  //       maxSize: MAX_FILE_SIZE,
  //       limit: 3,
  //       upload: () => Promise.resolve('upload'),
  //       onError: (error) => {
  //         console.error('Upload failed:', error);
  //       },
  //     }),
  //   ],
  //   onUpdate: () => {},
  //   onPaste: () => {},
  // };

  return (
    <div className={cn('editor-wrapper', editorClassName)}>
      <EditorContext.Provider value={{ editor }}>
        <Toolbar ref={toolbarRef} role='toolbar'>
          <div className={cn('toolbar-wrapper')}>{toolbar ? <>{toolbar}</> : <>{defaultToolbar}</>}</div>
        </Toolbar>
        <EditorContent editor={editor} className='markdown prose dark:prose-invert max-w-full' />
      </EditorContext.Provider>
    </div>
  );
}
