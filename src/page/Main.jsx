import React, { useCallback, useMemo, useState } from "react";
import isHotkey from "is-hotkey";
import { Editable, withReact, useSlate, Slate, ReactEditor, useEditor } from "slate-react";
import { Editor, Transforms, createEditor, Node } from "slate";
import { withHistory } from "slate-history";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider, useDrag, useDrop } from 'react-dnd'

import GridResizer from './GridResizer'
import { Button, Icon, Toolbar } from "../components";
import './style.css'
import { GridDrop } from './GridDnd'
import withGrid from './withGrid'


const Drop = ({element, ...props}) => {
  const editor = useEditor()
  const [{ over }, drop] = useDrop({
    accept: 'any',
    drop: (item, monitor) => {
      Transforms.moveNodes(editor, { at: ReactEditor.findPath(editor, item.element), to: ReactEditor.findPath(editor, element)})
    },
    collect: (monitor) => {
      return {
        over: monitor.isOver()
      }
    }
  })
  return (
    <div style={{ position: 'relative'}}>
      <div ref={drop}>
        {props.children}
      </div>
      <GridDrop editor={editor} element={element}/>
    </div>
  )
}

const Drag = ({element, children}) => {
  const [, drag, preview] = useDrag({
    item: { type: 'any', element },
  })
  
  return (
    <div style={{display: 'flex'}} >
      <div ref={drag} suppressContentEditableWarning={true} style={{background: 'pink', cursor: 'grabbing'}} contentEditable={"false"}>DND</div>
      <div ref={preview}>
        {children}
      </div>
    </div>
  )
}




















































const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code"
};

const LIST_TYPES = ["numbered-list", "bulleted-list"];

const RichTextExample = ({setOutput}) => {
  const [value, setValue] = useState(initialValue);
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const editor = useMemo(() => withGrid(withHistory(withReact(createEditor()))), []);

  return (
    <DndProvider backend={HTML5Backend}>
    <Slate
      editor={editor}
      value={value}
      onChange={(value) => {
        setValue(value);
        setOutput(value);
      }}
    >
      <Toolbar>
        <MarkButton format="bold" icon="format_bold" />
        <MarkButton format="italic" icon="format_italic" />
        <MarkButton format="underline" icon="format_underlined" />
        <MarkButton format="code" icon="code" />
        <BlockButton format="heading-one" icon="looks_one" />
        <BlockButton format="heading-two" icon="looks_two" />
        <BlockButton format="block-quote" icon="format_quote" />
        <BlockButton format="numbered-list" icon="format_list_numbered" />
        <BlockButton format="bulleted-list" icon="format_list_bulleted" />
      </Toolbar>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
        onKeyDown={(event) => {
          for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, event)) {
              event.preventDefault();
              const mark = HOTKEYS[hotkey];
              toggleMark(editor, mark);
            }
          }
        }}
      />
    </Slate>
    </DndProvider>
  );
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) => LIST_TYPES.includes(n.type),
    split: true
  });

  Transforms.setNodes(editor, {
    type: isActive ? "paragraph" : isList ? "list-item" : format
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === format
  });

  return !!match;
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};


const Element = ({ attributes, children, element }) => {
  const editor = useEditor();
  switch (element.type) {
    case "row":
      return <div {...attributes} style={{maxWidth: '100%', display: 'flex', background: '#eee'}}>{children}</div>;
    case "column":
      let width = 250;
      if(element.meta?.width) {
        width = element.meta.width;
      }
      return <div {...attributes} style={{width: `calc(100% * ${width})`, flexGrow: '0', flexShrink: '0', position: 'relative'}}>
              {children}
              <GridResizer element={element} editor={editor}/>
            </div>
    default:
      console.log('render')
      return (
          <Drop element={element}>
            <Drag style={{cursor:'cross'}} element={element}><p  {...attributes}>{children}</p></Drag>
          </Drop>
      );
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

const BlockButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'Element 1'}]
  },
  {
    type: 'paragraph',
    children: [{ text: 'Element 2'}]
  },
  {
    type: 'paragraph',
    children: [{ text: 'Element 3'}]
  },
  {
    type: 'paragraph',
    children: [{ text: 'Element 4'}]
  },
  {
    type: 'paragraph',
    children: [{ text: 'Element 5'}]
  },
  {
    type: 'paragraph',
    children: [{ text: 'Element 6'}]
  },

];

export default RichTextExample;
