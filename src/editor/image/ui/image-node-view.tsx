import React from 'react';
import type { NodeViewProps } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';

export const ImageNodeView: React.FC<NodeViewProps> = (props) => {
  const { src, alt, title } = props.node.attrs;

  const handleResize = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: Implement resize functionality
  };

  return (
    <NodeViewWrapper className='image-node-view' data-type='image' draggable='true' data-drag-handle>
      <div className='image-container'>
        <img src={src} alt={alt} title={title} className='node-image' />
        <div className='resize-handles'>
          <div className='resize-handle resize-handle-se' onMouseDown={handleResize} />
        </div>
      </div>
    </NodeViewWrapper>
  );
};
