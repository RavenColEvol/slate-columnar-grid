import React, { useRef, useState, useEffect } from 'react';
import { Form, Input, Button, Popover, Dropdown, Menu, Collapse, Card, InputNumber, Radio, Row, Col, Select, Tabs } from 'antd';
import { Editor, Transforms, Element } from 'slate'
import { useEditor, ReactEditor } from 'slate-react'
import { CSSJSON } from './cssToJson'
import { transform } from 'typescript';
import { ParagraphForm } from './formComponents'
import { LinkForm } from './formComponents/Link'
import { DesignComponent } from './DesignComponent'
import { Main } from './VisualBuilder';

const { Panel } = Collapse;
const { Option } = Select;

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

const getStylesFromStylesheet = (stylesheet) => {
    let css = [];
    for (let selector in stylesheet) {
        let style = `.${selector} {` ;
        
        for (let prop in stylesheet[selector]) {
          style += prop + ":" + stylesheet[selector][prop] + ';';
        }
        
        style += "}";
        
        css.push(style);
      }
    return css.join("\n");
}

export const getStyleSheetForStyle = () => {
    const custom_style = 'custom_style';
    const current_theme = 'general';
    let globalStyles = JSON.parse(localStorage.getItem(custom_style)) || {};
    if(globalStyles.hasOwnProperty(current_theme)) {
        const { desktop, mobile, tablet } = globalStyles[current_theme];
        let desktopStyles = getStylesFromStylesheet(desktop);
        let mobileStyles = getStylesFromStylesheet(mobile);
        let tabletStyles = getStylesFromStylesheet(tablet);
        return `
            ${desktopStyles}
            @media (max-width: 720px) {
                ${tabletStyles}
            }
            @media (max-width: 480px) {
                ${mobileStyles}
            }
        `
    }
    return "";
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

export const DefineStyle = (props) => {
    const [media, setMedia] = useState('desktop');
    const [type, setType] = useState(null);
    const [values, setValues] = useState({
        'scrte_p': {},
        'scrte_h1': {}
    });
    const handleFinish = ({theme}) => {
        let globalStyles = JSON.parse(localStorage.getItem('scrteStyleJson')) || {};
        if(localStorage.getItem('styles')) {
            let getTheme = JSON.parse(localStorage.getItem('styles'));
            getTheme[theme] = globalStyles;
            localStorage.setItem('styles', JSON.stringify(getTheme));
        }
        else {
            localStorage.setItem('styles', JSON.stringify({[theme]: globalStyles}))
        }
    } 

    useEffect(() => {
        handleChange([type]);
    }, [media])

    const handleMediaChange = (e, type) => {
        setMedia(e.target.value)
        setType(type)
    }

    const saveCSS = (tagName, e) => {
        const custom_style = 'custom_style';
        const current_theme = 'general';
        let globalStyles = JSON.parse(localStorage.getItem(custom_style)) || {};
        globalStyles[current_theme] = globalStyles[current_theme] || {};
        if(globalStyles[current_theme][media] ) {
            globalStyles[current_theme][media][tagName] = {
                ...(globalStyles[current_theme][media][tagName] || {}),
                [e.target.id]: e.target.value
            }
        }
        else {
            globalStyles[current_theme][media] = {
                [tagName]: {
                    [e.target.id]: e.target.value,
                }
            }
        }
        
        localStorage.setItem(custom_style, JSON.stringify(globalStyles));
        let styleSheet = getStyleSheetForStyle();
        let customStyleSheet = document.getElementById(custom_style);
        if(customStyleSheet) {
            customStyleSheet.innerText = styleSheet;
        } else {
            let scrteStyleSheet = document.createElement('style');
            scrteStyleSheet.type = "text/css";
            scrteStyleSheet.id = custom_style;
            scrteStyleSheet.appendChild(document.createTextNode(styleSheet));
            document.body.appendChild(scrteStyleSheet);
        }
    }

    const handleChange = (e) => {
        let valuesArray = [...e];
        let openedElement = valuesArray.pop();
        if(openedElement) {
            const custom_style = 'custom_style';
            const current_theme = 'general';
            let globalStyles = JSON.parse(localStorage.getItem(custom_style)) || {};
            if(globalStyles[current_theme] && globalStyles[current_theme][media] && globalStyles[current_theme][media][openedElement]) {
                setValues({
                    ...values,
                    [openedElement]: globalStyles[current_theme][media][openedElement]
                })
            }
        }
    }

    return (
        <React.Fragment>
            <Form onFinish={handleFinish}>
                <Row gutter={12}>
                    <Col span={18}>
                        <Form.Item
                            name='theme'
                        >
                            <Input placeholder='General'></Input>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item>
                            <Button htmlType='submit' type='primary'>Save Styles</Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
            
            <Collapse  expandIconPosition='right' onChange={handleChange}>
                <Panel header={<h4>Paragraph</h4>} key="scrte_p">
                    <MediaGroup media={media} handleMediaChange={handleMediaChange} type="scrte_p"/>
                    <ParagraphForm initialValues={values['scrte_p']} type='p' saveCSS={saveCSS}/>
                </Panel>
                <Panel header={<h4>Large Heading</h4>} key="scrte_h1">
                    <MediaGroup media={media} handleMediaChange={handleMediaChange} type="scrte_p"/>
                    <ParagraphForm initialValues={values['scrte_h1']} type='h1' saveCSS={saveCSS}/>
                </Panel>
                <Panel header={<h4>Medium Heading</h4>} key="scrte_h2">
                    <MediaGroup media={media} handleMediaChange={handleMediaChange} type="scrte_h2"/>
                    <ParagraphForm initialValues={values['scrte_h2']} type='h2' saveCSS={saveCSS}/>
                </Panel>
                <Panel header={<h4>Quote</h4>} key="scrte_quote">
                    <MediaGroup media={media} handleMediaChange={handleMediaChange} type="scrte_quote"/>
                    <ParagraphForm initialValues={values['scrte_quote']} type='quote' saveCSS={saveCSS}/>
                </Panel>
            </Collapse>

            <LinkForm saveCSS={saveCSS} />
        </React.Fragment>
    )
}

const MediaGroup = ({media, handleMediaChange, type}) => {
    return (
        <Row style={{marginBottom:'1.4rem'}}>
            <Col span={8}>
                <h5>Screen Size</h5>
            </Col>
            <Col span={16} style={{textAlign:'right'}}>
                <Radio.Group defaultValue={media} onChange={(e) => handleMediaChange(e, type)} >
                    <Radio.Button value="desktop">Desktop</Radio.Button>
                    <Radio.Button value="tablet">Tablet</Radio.Button>
                    <Radio.Button value="mobile">Mobile</Radio.Button>
                </Radio.Group>
            </Col>
        </Row>
        
    )
}

const { TabPane } = Tabs;

export const Design = (props) => {

    return (
        <Tabs defaultActiveKey='3'>
            <TabPane tab="Style" key="1" >
                <DefineStyle/>
            </TabPane>
            <TabPane tab="Design" key="2">
                <DesignComponent/>
            </TabPane>
            <TabPane tab="Visual" key="3">
                <Main/>
            </TabPane>
        </Tabs>
    )
}

export {
    DesignComponent
}

// export const DesignComponent = (props) => {
//     const editor = useEditor();
//     const selection = useRef(null);
//     const [form] = Form.useForm();
//     const handleFinish = (values) => {
//         Transforms.setNodes(editor, {
//             attrs: {
//                 styles: {
//                     background: values['background']
//                 }
//             }
//         }, {
//             at: selection.current
//         })
//     }

//     const handleBlur = (e) => {
//         if(!selection.current) return;
//         ReactEditor.focus(editor);
//         Transforms.select(editor, selection.current);
//         for(let [node, path] of Editor.nodes(editor, selection.current)) {
//             if(Element.isElement(node) && node.type !== 'docs') {
//                 let beforeAttrs = Object.assign({}, node.attrs);
//                 let beforeProps = {
//                     ...node.attrs?.styles,
//                     [e.target.id]: e.target.value
//                 }
//                 beforeAttrs['styles'] = beforeProps
//                 console.log(beforeAttrs)
//                 Transforms.setNodes(editor, { 
//                     attrs: beforeAttrs
//                 }, {
//                     at: path
//                 })
//             }
//         }
        
//     }

//     const handleFocus = () => {
//         if(!editor.selection) return;
//         const editorSelection = editor.selection;
//         let beforeProps = {

//         };
//         for(let [node, path] of Editor.nodes(editor, editorSelection)) {
//             if(Element.isElement(node) && node.type !== 'docs') {
//                 beforeProps = {
//                     ...node.attrs?.styles
//                 }
//                 form.setFieldsValue(beforeProps)
//             }
//         }
//         // console.log(form.getFieldsValue())
//         selection.current = editorSelection;
//     }

//     const applyCustomCss = ({customCss}) => {

//         let customStyleSheet = document.getElementById('scrteIncludedStylesheet');
//         if(customStyleSheet) {
//             customStyleSheet.innerText = customCss;
//         } else {
//             let scrteStyleSheet = document.createElement('style');
//             scrteStyleSheet.type = "text/css";
//             scrteStyleSheet.id = 'scrteIncludedStylesheet';
//             scrteStyleSheet.appendChild(document.createTextNode(customCss));
//             document.body.appendChild(scrteStyleSheet);
//         }
//     }

    
//     return (
//         <React.Fragment>
//             <Popover content={<SaveDesign values={form.getFieldsValue()} selection={selection.current}/>} trigger='click' placement='right'>
//                 <Button>Save Style</Button>
//             </Popover>
//             <ApplyStyles selection={editor.selection || selection.current} editor={editor}/>
//             <RemoveStyles selection={editor.selection || selection.current} editor={editor} />
            
//             <Card>

//                 <Form form={form} style={{maxWidth:'300px'}} onFinish={handleFinish} >
//                     <h5>Background</h5>
//                     <Form.Item
//                         name="background"
//                         rules={[{ message: 'Background Color' }]}
//                     >
//                         <Input onFocus={handleFocus} onBlur={handleBlur}/>
//                     </Form.Item>
//                     <h5>Padding</h5>
//                     <Form.Item
//                         name="padding"
//                         rules={[{ message: 'Padding' }]}
//                     >
//                         <Input onFocus={handleFocus} onBlur={handleBlur}/>
//                     </Form.Item>
//                     <h5>Border </h5>
//                     <Form.Item
//                         name="border"
//                         rules={[{ message: 'Border' }]}
//                     >
//                         <Input onFocus={handleFocus} onBlur={handleBlur}/>
//                     </Form.Item>
//                     <h5>Border Radius</h5>
//                     <Form.Item
//                         name="border-radius"
//                     >
//                         <Input onFocus={handleFocus} onBlur={handleBlur}/>
//                     </Form.Item>
//                     <h5>Font Color</h5>
//                     <Form.Item
//                         name="color"
//                     >
//                         <Input onFocus={handleFocus} onBlur={handleBlur}/>
//                     </Form.Item>
//                 </Form>
//             </Card>

//             {/* <Form onFinish={applyCustomCss}>
//                 <Form.Item
//                     name="customCss"

//                 >
//                     <Input.TextArea rows={4}/>
//                 </Form.Item>
//                 <Form.Item
                    
//                 >
//                     <Button htmlType='submit'>Apply CSS</Button>
//                 </Form.Item>
//             </Form> */}
//         </React.Fragment>
//     )
// }