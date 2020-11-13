import React, { useCallback, useMemo, useState, useEffect } from "react";
import isHotkey from "is-hotkey";
import { Editable, withReact, useSlate, Slate, useEditor, useSelected, useFocused } from "slate-react";
import { Editor, Transforms, createEditor } from "slate";
import { cx, css } from 'emotion'
import { withHistory } from "slate-history";

import { Drawer, Button as AButton} from 'antd'
import { Button, Icon, Toolbar } from "../components";
import { Design, getStyleSheet } from './Design';
import './style.css'


const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code"
};

const LIST_TYPES = ["numbered-list", "bulleted-list"];

const RichTextExample = ({setOutput}) => {
  const [value, setValue] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  useEffect(() => {
    let styleSheet = getStyleSheet();
    let scrteStyleSheet = document.createElement('style');
    scrteStyleSheet.type = "text/css";
    scrteStyleSheet.id = 'scrteStyleSheet';
    scrteStyleSheet.appendChild(document.createTextNode(styleSheet));
    document.body.appendChild(scrteStyleSheet);
  }, [])

  return (
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
            if(isHotkey('mod+e', event)) {
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
      />
      <Drawer visible={open} onClose={() => setOpen(false)} width="400px" mask={false}>
        <Design />
      </Drawer>
      
    </Slate>
    
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
 
  switch (element.type) {
    default:
      const selected = useSelected()
      const focused = useFocused();
      let { className, id, styles = {}} = element.attrs || {};
      if(selected && focused) {
        styles = {
          ...styles,
          border: '1px solid blue'
        };
      }
      return (
        <p  {...attributes} className={className} id={id} style={styles}>{children}</p>
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
