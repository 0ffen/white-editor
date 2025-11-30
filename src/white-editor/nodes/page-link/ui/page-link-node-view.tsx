import React from 'react';
import { LinkIcon } from 'lucide-react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';

export const PageLinkNodeView: React.FC<NodeViewProps> = ({ node }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (node.attrs.value) {
      window.open(node.attrs.value, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <NodeViewWrapper
      as='span'
      data-type='pageMention'
      data-id={node.attrs.id}
      data-label={node.attrs.label}
      data-value={node.attrs.value}
      onClick={handleClick}
    >
      <div className='we:flex we:items-center we:gap-1 we:bg-accent we:rounded-sm we:py-0.5 we:px-2'>
        <LinkIcon className='we:h-3 we:w-3 we:shrink-0' />
        {node.attrs.label || `&${node.attrs.id}`}
      </div>
    </NodeViewWrapper>
  );
};
