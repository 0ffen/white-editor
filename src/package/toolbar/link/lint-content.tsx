import type { Editor } from '@tiptap/react';
import { LinkMain } from './link-main';
import { useLinkPopover } from './use-link-popover';

export const LinkContent = ({ editor }: { editor?: Editor }) => {
  const linkPopover = useLinkPopover({
    editor,
  });

  return <LinkMain {...linkPopover} />;
};
