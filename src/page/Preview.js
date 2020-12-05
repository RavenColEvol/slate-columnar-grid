import React, { useCallback, useMemo, useState, useEffect } from "react";
import isHotkey from "is-hotkey";
import { Editable, withReact, useSlate, Slate, useEditor, useSelected, useFocused } from "slate-react";
import { Editor, Transforms, createEditor } from "slate";
import { cx, css } from 'emotion'
import { withHistory } from "slate-history";

import { Drawer, Button as AButton, Typography} from 'antd'
import { Button, Icon, Toolbar } from "../components";
import { Design, getStyleSheet } from './Design';
import { withCurrentSelection } from './withSaveSelection';
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import { DndBlockVisual } from './VisualBuilder/DndBlockVisual'
import { SaveTemplate } from './VisualBuilder/SaveTemplate'
import { getSingleEntry } from './VisualBuilder/utils'

import './style.css'
import { useParams } from "react-router-dom";

const { Title } = Typography;

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code"
};


const getValuesHelper = async (el, res, parent) => {
  let fieldAttrs = parent?.attrs?.field_attrs;
  if(!el.children) {
    if(fieldAttrs?.uid) {

      // ********     handle reference encountered  ********//
      if(fieldAttrs?.data_type === 'reference') {
        console.log("res", res[fieldAttrs?.uid], res)
        const references =  await Promise.all((res[fieldAttrs?.uid] || []).map(async reference => {
          let contentTypeUid = reference['_content_type_uid'];
          let uid = reference['uid']
          let json = JSON.parse(localStorage.getItem(`tempEditor__${contentTypeUid}`)) || [];
          //console.log(json, res[fieldAttrs?.uid])
          var val = await getSingleEntry(contentTypeUid, uid).then(res => {
            return getValues(json, res);
          });
          console.log("reference", val, json, uid, contentTypeUid)
          if(val === [] || val === undefined)
            return { type: 'paragraph', children: [{text: ''}]}
          else
            return { type: 'layout', children: val};
        }))
        return {
          type: 'layout',
          children: references
        }
      }

      // ********     handle multiple encountered  ********//
      if(fieldAttrs?.multiple) {
        if(typeof(res[fieldAttrs?.uid][0]) === 'string') {
          let newEl = {
            type: 'list',
            children: (res[fieldAttrs?.uid] || []).map(item => ({
              type: 'list-item',
              children: [{ text: item}]
            }))
          }
          return newEl;
        }
        else {
          return el
        }
      } 
      let newEl = {
        ...el,
        text: res[fieldAttrs?.uid]
      }
      return newEl
    }
    return el;
  } 
  let newEl = {
    ...el
  }
  newEl['children'] = await getValues(el.children, res, el);
  return newEl;
} 

const getValues = async (value, res, parent = {}) => {
  let result = [];
  let fieldAttrs = parent?.attrs?.field_attrs;
  if(fieldAttrs?.field_metadata?.ref_multiple) {
    console.log('multi reference encountered')
  }

  
  for(let el of value) {
    const json = await getValuesHelper(el, res, parent );
    result.push(json);
  }
  return result;
}


const RichTextExample = ({setOutput}) => {
  const { uid, entryId } = useParams();
  let tempEditor = localStorage.getItem(`tempEditor__${uid}`) ? JSON.parse(localStorage.getItem(`tempEditor__${uid}`)) : null;
  const [value, setValue] = useState(tempEditor || initialValue);
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const editor = useMemo(() => withReact(createEditor()), []);


  useEffect(() => {
    let styleSheet = getStyleSheet();
    let scrteStyleSheet = document.createElement('style');
    scrteStyleSheet.type = "text/css";
    scrteStyleSheet.id = 'scrteStyleSheet';
    scrteStyleSheet.appendChild(document.createTextNode(styleSheet));
    document.body.appendChild(scrteStyleSheet);

    getSingleEntry(uid, entryId).then(res => {
      console.log(res);
      getValues(value, res).then(r => {
        console.log("use effect", r); setValue(r) });
    })
  }, [])

  return (
      <Slate
        editor={editor}
        value={value}
        onChange={() => {}}
      >
        
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="Enter some rich text…"
            spellCheck
            autoFocus
            contentEditable='false'
            readOnly='true'
            onKeyDown={(event) => {}}
          />
        
      </Slate>
  );
};





const Element = ({ attributes, children, element }) => {
  const selected = useSelected()
      const focused = useFocused();
      let { className, id, styles = {}} = element.attrs || {};
      className = className && className.join(' ')
      if(selected && focused) {
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
    case 'link':
      return (
        <a href="https://test.com" {...attributes} className={cx(className, 'scrte_a')} id={id} style={styles}>{children}</a>
      )
    case 'list':
      return (
        <ul {...attributes}>{children}</ul>
      )
    case 'list-item':
      return (
        <li {...attributes}>{children}</li>
      )
    default:
      return (
        <p placeholder='Type /'  {...attributes} className={cx(className, 'scrte_p')} id={id} style={styles}>{children}</p>
      );
    
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  //console.log(children, attributes, leaf);
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



const initialValue = [
  {
    type: 'link',
    children: [{ text: 'Element 1'}]
  },
  {
    type: 'heading-one',
    attrs: {
      className: ['button'],
    },
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
