import React, { useCallback, useMemo, useState, useEffect } from "react";
import isHotkey from "is-hotkey";
import { Editable, withReact, useSlate, Slate, useEditor, useSelected, useFocused } from "slate-react";
import { Editor, Transforms, createEditor, Node } from "slate";
import { cx, css } from 'emotion'
import { useParams } from 'react-router-dom'
import { withHistory } from "slate-history";

import { Drawer, Button as AButton, Typography, List, Card } from 'antd'
import { Button, Icon, Toolbar } from "../components";
import { Design, getStyleSheet } from './Design';
import { withCurrentSelection } from './withSaveSelection';
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import { DndBlockVisual } from './VisualBuilder/DndBlockVisual'
import { SaveTemplate } from './VisualBuilder/SaveTemplate'

import './style.css'

const { Title } = Typography;

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code"
};

const LIST_TYPES = ["numbered-list", "bulleted-list"];

const RichTextExample = ({ setOutput }) => {
  const { uid } = useParams();
  let tempEditor = localStorage.getItem(`tempEditor__${uid}`) ? JSON.parse(localStorage.getItem(`tempEditor__${uid}`)) : null;
  const [value, setValue] = useState(tempEditor || initialValue);
  const [open, setOpen] = useState(false);
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const saveSelection = () => {
    editor.savedSelection = editor.selection;
  }

  useEffect(() => {
    let styleSheet = getStyleSheet();
    let scrteStyleSheet = document.createElement('style');
    scrteStyleSheet.type = "text/css";
    scrteStyleSheet.id = 'scrteStyleSheet';
    scrteStyleSheet.appendChild(document.createTextNode(styleSheet));
    document.body.appendChild(scrteStyleSheet);
  }, [])

  return (
    <DndProvider backend={HTML5Backend}>
      <Slate
        editor={editor}
        value={value}
        onChange={(value) => {
          localStorage.setItem(`tempEditor__${uid}`, JSON.stringify(value));
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
          <BlockButton format="grid-list" icon="view_module" />
          <SaveTemplate />
        </Toolbar>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Enter some rich text…"
          spellCheck
          autoFocus
          onKeyDown={(event) => {
            for (const hotkey in HOTKEYS) {
              if (isHotkey('mod+e', event)) {
                event.preventDefault();
                setOpen(!open);
              }
              if (isHotkey(hotkey, event)) {
                event.preventDefault();
                const mark = HOTKEYS[hotkey];
                toggleMark(editor, mark);
              }
            }
          }}
          onBlur={saveSelection}
        />
        <Drawer visible={true} onClose={() => setOpen(false)} width="500px" mask={false}>
          <Design />
        </Drawer>

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

  if (format === 'grid-list') {
    let [node] = Editor.nodes(editor, { match: n => n.type === 'grid-list', mode: "lowest" })
    let copyNode = JSON.parse(JSON.stringify(node[0]))
    copyNode.attrs = {
      gutter: 16,
      column: 3,
      vgutter: 16
    }
    let child = Array.from({ length: 8 }).map((val, index) => ({
      type: 'grid-child',
      attrs: {},
      children: [{ text: `Item ${index}` }]
    }))
    copyNode.children = child
    Transforms.removeNodes(editor, { at: node[1] })

    Transforms.insertNodes(editor, copyNode, { at: node[1] })
  }
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
  const selected = useSelected()
  const focused = useFocused();
  let attrs = element.attrs || {}
  let { className, id, styles = {} } = attrs
  className = className && className.join(' ')
  if (selected && focused) {
    styles = {
      ...styles,
      border: '1px solid blue'
    };
  }
  const empty = element.children[0].text === '';

  switch (element.type) {

    case 'heading-one':
      return (
        <h1 level={1} {...attributes} className={cx(className, 'scrte_h1')} id={id} style={styles}>{children}</h1>
      )
    case 'grid-child':
      return (
        <div style={{ border: "1px solid #eee" }}  {...attributes} >{children}</div>

      )
    case 'grid-list':
      return (
        <div {...attributes} style={{ padding: '10px 0', display: 'grid', gridTemplateColumns: `repeat(${attrs.column},1fr)`, gridGap: `${attrs.vgutter}px ${attrs.gutter}px` }}>
          {children}
        </div>
      )
    // case 'link':
    //   return (
    //     <a href="https://test.com" {...attributes} className={cx(className, 'scrte_a')} id={id} style={styles}>{children}</a>
    //   )
    default:

      return (
        <DndBlockVisual element={element}>
          <p placeholder='Type /'  {...attributes} className={cx(className, 'scrte_p')} id={id} style={styles}>{children}</p>
        </DndBlockVisual>
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
    type: 'link',
    children: [{ text: 'Element 1' }]
  },
  {
    type: 'heading-one',
    attrs: {
      className: ['button'],
    },
    children: [{ text: 'Element 2' }]
  },
  {
    type: 'paragraph',
    children: [{ text: 'Element 3' }]
  },
  {
    type: 'paragraph',
    children: [{ text: 'Element 4' }]
  },
  {
    type: 'paragraph',
    children: [{ text: 'Element 5' }]
  },
  {
    type: 'paragraph',
    children: [{ text: 'Element 6' }]
  },

];

export default RichTextExample;
