import React, { useRef } from 'react'
import { useDrop } from 'react-dnd'
import { Transforms } from 'slate'
import { ReactEditor, useEditor } from 'slate-react'


export const DndBlockVisual = (props) => {
  const { children, element } = props;
  const editor = useEditor();

  const accept = 'docs'
  const [, drop] = useDrop({
    accept: accept,
    collect: (monitor) => {

    },
    hover: (item, monitor) => {
    },
    drop: (item, monitor) => {
      let path = [...ReactEditor.findPath(editor, element)];
      path = [...path.splice(0, path.length - 1), path[path.length - 1] + 1]
      let node = {};
      Object.assign(node, item.template);
      if (node?.attrs?.field_attrs?.multiple) {
        node.type = 'list-container'
        let child = Array.from({ length: 4 }).map((val, index) => ({
          type: 'list-child',
          attrs: {},
          children: [{ text: `Item ${index}` }]
        }))
        node.children = child
      }
      Transforms.insertNodes(editor, node, {
        at: path
      })
    }
  })
  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={drop}
        {...props}
      >
        {children}
      </div>
    </div>
  )
}