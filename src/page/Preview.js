import React, { useCallback, useMemo, useState, useEffect } from "react";
import { Editable, withReact, Slate, useSelected, useFocused } from "slate-react";
import { createEditor } from "slate";
import { cx } from 'emotion'

import { getStyleSheet } from './Design';

import { getSingleEntry } from './VisualBuilder/utils'
import { get } from 'idb-keyval';

import './style.css'
import { useParams } from "react-router-dom";

const multiValueType = ['grid-list', 'list-container']
const multiValueField = {
  'list-container': 'list-child',
  'grid-list': 'grid-child'
}
const getValuesHelper = async (el, res, parent) => {
  let fieldAttrs = parent?.attrs?.field_attrs;
  if (!el.children) {
    if (fieldAttrs?.uid) {

      // ********     handle reference encountered  ********//
      if (fieldAttrs?.data_type === 'reference') {
        const references = await Promise.all((res[fieldAttrs?.uid] || []).map(async reference => {
          let contentTypeUid = reference['_content_type_uid'];
          let uid = reference['uid']
          let json = [{ text: '' }];
          let visualPageIdReference = parent?.visualPageId || 1;
          get('list').then(res => {
            json = res?.[contentTypeUid]?.[visualPageIdReference]?.['json']
          })
          var val = await getSingleEntry(contentTypeUid, uid).then(res => {
            return getValues(json, res);
          });
          if (val === [] || val === undefined)
            return { type: 'paragraph', children: [{ text: '' }] }
          else
            return { type: 'layout', children: val };
        }))
        return {
          type: 'reference',
          children: references
        }
      }

      // ********     handle multiple encountered  ********//
      if (fieldAttrs?.multiple) {
        if (typeof (res[fieldAttrs?.uid][0]) === 'string') {
          let newEl = {
            type: parent.type,
            attrs: { ...parent.attrs },
            children: (res[fieldAttrs?.uid] || []).map(item => {
              return ({
                type: multiValueField[parent.type],
                children: [{ text: item }]
              })
            })
          }
          return newEl;
        }
        else {
          return el
        }
      }
      let newEl = {
        ...el,
        text: String(res[fieldAttrs?.uid])
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

  for (let el of value) {
    if (multiValueType.includes(el.type)) {
      el = { ...el, children: [{ text: '{{hi}}' }] }
    }
    const json = await getValuesHelper(el, res, parent);
    if (multiValueType.includes(el.type)) {
      result.push(json.children[0]);
    }
    else {
      result.push(json);
    }
  }
  return result;
}


const RichTextExample = ({ setOutput }) => {
  const { uid, entryId, visualPageId } = useParams();
  const [value, setValue] = useState(initialValue);
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

    get('list').then(res => {
      let value = res[uid][visualPageId]['json'];
      //console.log('useEffect', uid, visualPageId);
      getSingleEntry(uid, entryId).then(res => {
        getValues(value, res).then(r => {
          console.log("use effect", r); setValue(r)
        });
      })
    })

  }, [])

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={() => { }}
    >

      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
        contentEditable='false'
        readOnly='true'
        onKeyDown={(event) => { }}
      />

    </Slate>
  );
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
    case 'grid-child':
      return (
        <div  {...attributes} style={{ padding: '5px 10px', borderRadius: '3px', background: '#f2f4f5', border: "1px solid #f0f0f0" }}>{children}</div>
      )
    case 'grid-list':
      return (
        <div {...attributes} style={{ padding: '10px 0', display: 'grid', gridTemplateColumns: `repeat(${attrs.column},1fr)`, gridGap: `${attrs.vgutter}px ${attrs.gutter}px` }}>
          {children}
        </div>
      )
    case 'list-container':
      return (
        <div {...attributes}>
          {children}
        </div>
      )
    case 'list-child':
      return (
        <div {...attributes} style={{ padding: '5px 10px', borderRadius: '3px', background: '#f2f4f5', border: "1px solid #f0f0f0", marginBottom: '0.4rem' }}>
          {children}
        </div>
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
    type: 'paragraph',
    children: [{ text: 'Loading' }]
  },
];

export default RichTextExample;
