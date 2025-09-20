import { useLinkPopover } from '@/editor';
import type { Editor } from '@tiptap/react';
import { LinkMain } from './link-main';

export const LinkContent = ({ editor }: { editor?: Editor }) => {
  const linkPopover = useLinkPopover({
    editor,
  });

  return <LinkMain {...linkPopover} />;
};
