import React, { useRef } from 'react';
import { Form, Input, Button, Popover, Dropdown, Menu } from 'antd';
import { Editor, Transforms, Element } from 'slate'
import { useEditor, ReactEditor } from 'slate-react'
import { CSSJSON } from './cssToJson'
import { transform } from 'typescript';

export const getStyleSheet = () => {
    let globalStyles = JSON.parse(localStorage.getItem('scrteStyleJson'));
    let css = [];
    for (let selector in globalStyles) {
        let style = `.${selector} {` ;
        
        for (let prop in globalStyles[selector]) {
          style += prop + ":" + globalStyles[selector][prop] + ';';
        }
        
        style += "}";
        
        css.push(style);
      }
    return css.join("\n");
}

export const getStyleSheetM = () => {
    let globalStyles = JSON.parse(localStorage.getItem('scrteStyleJson'));
    let css = [];
    for (let selector in globalStyles) {
        let style = `${selector} {` ;
        
        for (let prop in globalStyles[selector]) {
          style += prop + ":" + globalStyles[selector][prop] + ';';
        }
        
        style += "}";
        
        css.push(style);
      }
    return css.join("\n");
}

export const ApplyStyles = ({selection}) => {
    const editor = useEditor();
    const Classes = () => {
        let globalStyles = JSON.parse(localStorage.getItem('scrteStyleJson'));
        const handleClick = (className) => {
            for(let [node, path] of Editor.nodes(editor, editor.selection || selection)) {
                if(Element.isElement(node) && node.type !== 'docs') {
                    let beforeAttrs = Object.assign({}, node.attrs);
                    // case 1: first
                    if(beforeAttrs.hasOwnProperty('className') === false) {
                        beforeAttrs['className'] = className;
                    }
                    // case 2: new class
                    else if(!beforeAttrs['className'].includes(className)) {
                        beforeAttrs['className'] += ` ${className}`;
                    }
                    Transforms.setNodes(editor, { 
                        attrs: beforeAttrs
                    }, {
                        at: path
                    })
                }
            }
        }
        return <Menu >{
            Object.entries(globalStyles).map(declaration => {
                return <Menu.Item key={declaration[0]} onMouseDown={(e) => {
                    e.preventDefault();
                    handleClick(declaration[0])}
                }>{declaration[0]}</Menu.Item>
            })
            }</Menu>
    }
    const menu = <Classes/>
    return (
        <Dropdown overlay={menu} trigger={['click']}>
            <Button onMouseDown={e => e.preventDefault()}>Apply Styles</Button>
        </Dropdown>
    )
}

const RemoveStyles = ({selection}) => {
    const editor = useEditor();
    const Classes = () => {
        let globalStyles = JSON.parse(localStorage.getItem('scrteStyleJson'));
        const handleClick = (className) => {
            for(let [node, path] of Editor.nodes(editor, editor.selection || selection)) {
                if(Element.isElement(node) && node.type !== 'docs') {
                    let beforeAttrs = Object.assign({}, node.attrs);
                    if(beforeAttrs.hasOwnProperty('className') && beforeAttrs['className'].includes(className)) {
                        let expression = `\s?${className}`;
                        let regex = new RegExp(expression);
                        beforeAttrs['className'] = beforeAttrs['className'].replace(regex, '');
                    }
                    Transforms.setNodes(editor, { 
                        attrs: beforeAttrs
                    }, {
                        at: path
                    })
                }
            }
        }
        return <Menu >{
            Object.entries(globalStyles).map(declaration => {
                return <Menu.Item key={declaration[0]} onMouseDown={(e) => {
                    e.preventDefault();
                    handleClick(declaration[0])}
                }>{declaration[0]}</Menu.Item>
            })
            }</Menu>
    }
    const menu = <Classes/>
    return (
        <Dropdown overlay={menu} trigger={['click']}>
            <Button onMouseDown={e => e.preventDefault()}>Remove Styles</Button>
        </Dropdown>
    )
}

const SaveDesign = ({values, selection}) => {
    const editor = useEditor();
    const handleFinish = ({className}) => {
        let globalStyles = JSON.parse(localStorage.getItem('scrteStyleJson')) || {};

        globalStyles[className] = values;
        
        localStorage.setItem('scrteStyleJson', JSON.stringify(globalStyles));
        let styleSheet = getStyleSheet();
        let customStyleSheet = document.getElementById('scrteStyleSheet');
        if(customStyleSheet) {
            customStyleSheet.innerText = styleSheet;
        } else {
            let scrteStyleSheet = document.createElement('style');
            scrteStyleSheet.type = "text/css";
            scrteStyleSheet.id = 'scrteStyleSheet';
            scrteStyleSheet.appendChild(document.createTextNode(styleSheet));
            document.body.appendChild(scrteStyleSheet);
        }

        ReactEditor.focus(editor);
        Transforms.select(editor, selection);

        for(let [node, path] of Editor.nodes(editor, editor.selection || selection)) {
            if(Element.isElement(node) && node.type !== 'docs') {
                let beforeAttrs = Object.assign({}, node.attrs);
                // case 1: first
                if(beforeAttrs.hasOwnProperty('className') === false) {
                    beforeAttrs['className'] = className;
                }
                // case 2: new class
                else if(!beforeAttrs['className'].includes(className)) {
                    beforeAttrs['className'] += ` ${className}`;
                }
                delete beforeAttrs['styles'];
                Transforms.setNodes(editor, { 
                    attrs: beforeAttrs
                }, {
                    at: path
                })
            }
        }
        
    }
    return (
        <Form onFinish={handleFinish}>
            <Form.Item
                    label="Style name"
                    name="className"
                    rules={[{ message: 'Enter Name' }]}
            >
                <Input onFocus={() => {
                    console.log(selection);
                }}/>
            </Form.Item>
            <Form.Item
            >
                <Button htmlType='submit' type='primary'>Save</Button>
            </Form.Item>
        </Form>
    )
}

export const Design = (props) => {
    const editor = useEditor();
    const selection = useRef(null);
    const [form] = Form.useForm();
    const handleFinish = (values) => {
        Transforms.setNodes(editor, {
            attrs: {
                styles: {
                    background: values['background']
                }
            }
        }, {
            at: selection.current
        })
    }

    const handleBlur = (e) => {
        if(!selection.current) return;
        ReactEditor.focus(editor);
        Transforms.select(editor, selection.current);
        for(let [node, path] of Editor.nodes(editor, selection.current)) {
            if(Element.isElement(node) && node.type !== 'docs') {
                let beforeAttrs = Object.assign({}, node.attrs);
                let beforeProps = {
                    ...node.attrs?.styles,
                    [e.target.id]: e.target.value
                }
                beforeAttrs['styles'] = beforeProps
                console.log(beforeAttrs)
                Transforms.setNodes(editor, { 
                    attrs: beforeAttrs
                }, {
                    at: path
                })
            }
        }
        
    }

    const handleFocus = () => {
        if(!editor.selection) return;
        const editorSelection = editor.selection;
        let beforeProps = {

        };
        for(let [node, path] of Editor.nodes(editor, editorSelection)) {
            if(Element.isElement(node) && node.type !== 'docs') {
                beforeProps = {
                    ...node.attrs?.styles
                }
                form.setFieldsValue(beforeProps)
            }
        }
        // console.log(form.getFieldsValue())
        selection.current = editorSelection;
    }

    const applyCustomCss = ({customCss}) => {
        
        let customStyleSheet = document.getElementById('scrteIncludedStylesheet');
        if(customStyleSheet) {
            customStyleSheet.innerText = customCss;
        } else {
            let scrteStyleSheet = document.createElement('style');
            scrteStyleSheet.type = "text/css";
            scrteStyleSheet.id = 'scrteIncludedStylesheet';
            scrteStyleSheet.appendChild(document.createTextNode(customCss));
            document.body.appendChild(scrteStyleSheet);
        }
    }

    
    return (
        <React.Fragment>
            <Popover content={<SaveDesign values={form.getFieldsValue()} selection={selection.current}/>} trigger='click' placement='right'>
                <Button>Save Style</Button>
            </Popover>
            <ApplyStyles selection={editor.selection || selection.current} editor={editor}/>
            <RemoveStyles selection={editor.selection || selection.current} editor={editor} />
            
            <Form form={form} style={{maxWidth:'300px'}} onFinish={handleFinish} >
                <Form.Item
                    label="background"
                    name="background"
                    rules={[{ message: 'Background Color' }]}
                >
                    <Input onFocus={handleFocus} onBlur={handleBlur}/>
                </Form.Item>
                <Form.Item
                    label="padding"
                    name="padding"
                    rules={[{ message: 'Padding' }]}
                >
                    <Input onFocus={handleFocus} onBlur={handleBlur}/>
                </Form.Item>
                <Form.Item
                    label="border"
                    name="border"
                    rules={[{ message: 'Border' }]}
                >
                    <Input onFocus={handleFocus} onBlur={handleBlur}/>
                </Form.Item>
                <Form.Item
                    label="border radius"
                    name="border-radius"
                >
                    <Input onFocus={handleFocus} onBlur={handleBlur}/>
                </Form.Item>
                <Form.Item
                    label="Font color"
                    name="color"
                >
                    <Input onFocus={handleFocus} onBlur={handleBlur}/>
                </Form.Item>
            </Form>

            <Form onFinish={applyCustomCss}>
                <Form.Item
                    label="custom css"
                    name="customCss"

                >
                    <Input.TextArea rows={4}/>
                </Form.Item>
                <Form.Item
                    
                >
                    <Button htmlType='submit'>Apply CSS</Button>
                </Form.Item>
            </Form>
        </React.Fragment>
    )
}