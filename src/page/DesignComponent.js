import React, { useRef, useEffect, useContext } from 'react'
import { Transforms, Element, Editor, Range, Node } from 'slate'
import { useEditor, ReactEditor, useSlate } from 'slate-react'
import { Col, Collapse, Row, Card, Input, Radio, Slider, InputNumber, Form, Select, Tag, Menu, Dropdown, Button } from 'antd';
import { AlignCenterOutlined, AlignLeftOutlined, AlignRightOutlined, DownOutlined } from '@ant-design/icons'
import { useCurrentSelection, CurrentSelectionContext } from './withSaveSelection'

const { Panel } = Collapse;
const { Option } = Select;
let globalStyles = JSON.parse(localStorage.getItem('scrteStyleJson'));
export const ApplyStyles = () => {
    const editor = useSlate();
    const isCollapsed = editor.selection && Range.isCollapsed(editor.selection);
    let classes = []
    if (isCollapsed) {
        classes = Editor.parent(editor, editor.selection)[0]?.attrs?.className || [];
        //form.setFieldsValue({classList: classes})
    }
    console.log(classes)
    const Classes = () => {
        let globalStyles = JSON.parse(localStorage.getItem('scrteStyleJson'));
        const handleClick = (className) => {
            for (let [node, path] of Editor.nodes(editor, editor.savedSelection)) {
                if (Element.isElement(node) && node.type !== 'docs') {
                    let beforeAttrs = Object.assign({}, node.attrs);

                    // case 1: first
                    if (beforeAttrs.hasOwnProperty('className') === false) {
                        beforeAttrs['className'] = [className];
                    }
                    // case 2: new class
                    else if (beforeAttrs['className'].includes(className)) {
                        let beforeClasses = [...beforeAttrs['className']]

                        beforeAttrs['className'] = beforeClasses.filter((c) => c != className);
                    }
                    else {
                        beforeAttrs['className'] = [...beforeAttrs['className'], className];
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
                    handleClick(declaration[0])
                }
                }>{declaration[0]}</Menu.Item>
            })
        }</Menu>
    }
    const menu = <Classes />
    return (
        <Dropdown overlay={menu} trigger={['click']} >
            <Button style={{ marginBottom: '1.4rem' }} block={true} onMouseDown={e => e.preventDefault()}>Apply Styles <DownOutlined /></Button>
        </Dropdown>
    )
}


function tagRender(props) {
    const { label, value } = props;
    console.log(props);
    return (
        <Tag color='processing' closable style={{ marginRight: 3 }}>
            {value}
        </Tag>
    );
}

export const Classes = () => {
    const editor = useSlate();
    const form = Form.useForm();
    const isCollapsed = editor.selection && Range.isCollapsed(editor.selection);
    let classes = []
    if (isCollapsed) {
        classes = Editor.parent(editor, editor.selection)[0]?.attrs?.className || [];
        //form.setFieldsValue({classList: classes})
    }
    return (
        <Select
            mode="multiple"
            showArrow
            defaultValue={classes}
            tagRender={tagRender}
            style={{ width: '100%' }}
        >
            {Object.entries(globalStyles).map(declaration => {
                return <Option key={declaration[0]} value={declaration[0]}>{declaration[0]}</Option>
            })}
        </Select>
    )
}

export const DesignComponent = () => {
    const editor = useEditor();
    const handleBlur = (e) => {
        let selection = editor.savedSelection;
        if (!selection) return;
        ReactEditor.focus(editor);
        Transforms.select(editor, selection);
        for (let [node, path] of Editor.nodes(editor, selection)) {

            if (Element.isElement(node) && node.type !== 'docs') {
                let beforeAttrs = Object.assign({}, node.attrs);
                let beforeProps = {
                    ...node.attrs?.styles,
                    [e.target.id]: e.target.value
                }
                beforeAttrs['styles'] = beforeProps
                Transforms.setNodes(editor, {
                    attrs: beforeAttrs
                }, {
                    at: path
                })
            }
        }
    }


    return (
        <div>
            <ApplyStyles editor={editor} />
            <div style={{marginBottom: '1.4rem'}}></div>
            <Collapse defaultActiveKey={['extra']}>
                <Panel header={<h5>Dimension</h5>} key="dimension">
                    <DimensionForm
                        handleBlur={handleBlur}
                    />
                </Panel>
                <Panel header={<h5>Typography</h5>} key="typography">
                    <TypographyForm
                        handleBlur={handleBlur}
                        editor={editor}
                    />
                </Panel>
                <Panel header={<h5>Decorations</h5>} key="decorations">
                    <DecorationForm
                        handleBlur={handleBlur}
                    />
                </Panel>
                <Panel header={<h5>Extra</h5>} key="extra">
                    <ExtraForm handleBlur={handleBlur} editor={editor}/>
                </Panel>
            </Collapse>
        </div>
    )
}


const addUnit = (e, unit) => {
    e.target.value = `${e.target.value}${unit}`
    return e;
}

const DimensionForm = ({ handleBlur, handleFocus }) => {
    return (
        <React.Fragment>
            <Form>
                <Card title='Padding' size='small' style={{ marginBottom: '1.4rem' }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <h5>Top</h5>
                            <Form.Item name='paddingTop'>
                                <Input onFocus={handleFocus} onBlur={(e) => {
                                    e.persist();
                                    handleBlur(addUnit(e, 'px'))
                                }} addonAfter='px' />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <h5>Bottom</h5>
                            <Form.Item name='paddingBottom'>
                                <Input onFocus={handleFocus} onBlur={(e) => {
                                    e.persist();
                                    handleBlur(addUnit(e, 'px'))
                                }} addonAfter='px' />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <h5>Left</h5>
                            <Form.Item name='paddingLeft'>
                                <Input onFocus={handleFocus} onBlur={(e) => {
                                    e.persist();
                                    handleBlur(addUnit(e, 'px'))
                                }} addonAfter='px' />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <h5>Right</h5>
                            <Form.Item name='paddingRight'>
                                <Input onFocus={handleFocus} onBlur={(e) => {
                                    e.persist();
                                    handleBlur(addUnit(e, 'px'))
                                }} addonAfter='px' />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
                <Card title='Margin' size='small'>
                    <Row gutter={16}>
                        <Col span={12}>
                            <h5>Top</h5>
                            <Form.Item name='marginTop'>
                                <Input onFocus={handleFocus} onBlur={(e) => {
                                    e.persist();
                                    handleBlur(addUnit(e, 'px'))
                                }} addonAfter='px' />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <h5>Bottom</h5>
                            <Form.Item name='marginBottom'>
                                <Input onFocus={handleFocus} onBlur={(e) => {
                                    e.persist();
                                    handleBlur(addUnit(e, 'px'))
                                }} addonAfter='px' />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <h5>Left</h5>
                            <Form.Item name='marginLeft'>
                                <Input onFocus={handleFocus} onBlur={(e) => {
                                    e.persist();
                                    handleBlur(addUnit(e, 'px'))
                                }} addonAfter='px' />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <h5>Right</h5>
                            <Form.Item name='marginRight'>
                                <Input onFocus={handleFocus} onBlur={(e) => {
                                    e.persist();
                                    handleBlur(addUnit(e, 'px'))
                                }} addonAfter='px' />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
            </Form>
        </React.Fragment>
    )
}


const TypographyForm = ({ handleBlur, handleFocus, editor }) => {
    return (
        <React.Fragment>
            <Form>
                <Card size='small' style={{ marginBottom: '1.4rem' }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <h5>Font Family</h5>
                            <Form.Item name='fontFamily'>
                                <Select
                                    style={{ width: '100%' }}
                                    defaultValue="inherit"
                                    onFocus={handleFocus}
                                    onChange={(e) => {
                                        let event = {
                                            target: {
                                                id: 'font-family',
                                                value: e
                                            }
                                        }
                                        handleBlur(event);
                                    }}>
                                    <Option value="inherit">Default</Option>
                                    <Option value="cursive">Cursive</Option>
                                    <Option value="monospace">Monospace</Option>
                                    <Option value="sans-serif">Sans-serif</Option>
                                    <Option value="serif">Serif</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <h5>Font Weight</h5>
                            <Form.Item name='fontWeight'>
                                <Select
                                    style={{ width: '100%' }}
                                    defaultValue="400"
                                    onFocus={handleFocus}
                                    onChange={(e) => {
                                        let event = {
                                            target: {
                                                id: 'fontWeight',
                                                value: e
                                            }
                                        }
                                        handleBlur(event);
                                    }}>
                                    <Option value="300">300 (Thin)</Option>
                                    <Option value="400">400 (Default)</Option>
                                    <Option value="500">500 (Medium)</Option>
                                    <Option value="600">600 (Bold)</Option>
                                    <Option value="700">700 (Bolder)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <h5>Font color</h5>
                    <Form.Item name='color'>
                        <Input onFocus={handleFocus} onBlur={handleBlur} />
                    </Form.Item>
                </Card>
            </Form>
        </React.Fragment>
    )
}

const ExtraForm = ({editor, handleBlur}) => {
    const handleClick = (className) => {
        for(let [node, path] of Editor.nodes(editor, editor.savedSelection)) {
            console.log(node, path)
            if(Element.isElement(node) && node.type !== 'docs') {
                let beforeAttrs = Object.assign({}, node.attrs);
                // case 1: first
                if(beforeAttrs.hasOwnProperty('className') === false) {
                    beforeAttrs['className'] = [className, 'animate__animated'];
                }
                // case 2: new class
                else if (beforeAttrs['className'].includes(className)) {
                    let beforeClasses = [...beforeAttrs['className'], 'animate__animated']

                    beforeAttrs['className'] = beforeClasses.filter((c) => c != className);
                }
                else {
                    beforeAttrs['className'] = [...beforeAttrs['className'], className, 'animate__animated'];
                }
                Transforms.setNodes(editor, { 
                    attrs: beforeAttrs
                }, {
                    at: path
                })
            }
        }
    }
    const handleBlurIntermediate = () => {
        let styles = '';
        Object.entries(form.getFieldsValue()).forEach((val) => {
            if(val[1]) {
                if(val[0].startsWith('rotate')) {
                    styles += ` ${val[0]}(${val[1]}deg)`; 
                }
                else styles += ` ${val[0]}(${val[1]})`; 
            }
        })
        console.log(styles);
        handleBlur({
            target: {
                value: styles,
                id: 'transform'
            }
        })
    }
    const [form] = Form.useForm();
    const menu = (
        <Menu>
            <Menu.Item onMouseDown={(e) => {
                e.preventDefault();
                handleClick('animate__fadeIn')}
            }>fade in</Menu.Item>
        </Menu>
    )   
    
    return (
        <React.Fragment>
            <Card title='Transform' size='small' style={{ marginBottom: '1.4rem' }}>
                <Dropdown overlay={menu} trigger={['click']}>
                    <Button block='true'>Animation <DownOutlined /></Button>
                </Dropdown>
            </Card>
            <Form form={form}>
                <Card title='Transform' size='small' style={{ marginBottom: '1.4rem' }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <h5>Scale X</h5>
                            <Form.Item name='scaleX'>
                                <Input onBlur={handleBlurIntermediate} addonAfter='px' />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <h5>Scale Y</h5>
                            <Form.Item name='scaleY'>
                                <Input  onBlur={handleBlurIntermediate} addonAfter='px' />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <h5>Rotate X</h5>
                            <Form.Item name='rotateX'>
                                <Input  onBlur={handleBlurIntermediate} addonAfter='deg' />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <h5>Rotate Y</h5>
                            <Form.Item name='rotateY'>
                                <Input  onBlur={handleBlurIntermediate} addonAfter='deg' />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <h5>Rotate Z</h5>
                            <Form.Item name='rotateZ'>
                                <Input  onBlur={handleBlurIntermediate} addonAfter='deg' />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
            </Form>
        </React.Fragment>
    )
}


const DecorationForm = ({ handleBlur, handleFocus }) => {
    return (
        <React.Fragment>
            <Form>
                <Form.Item name='opacity'>
                    <h5>Opacity</h5>
                    <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={(e) => {
                            const event = {
                                target: {
                                    id: 'opacity',
                                    value: e
                                }
                            }
                            handleBlur(event);
                        }}
                    />
                </Form.Item>
                <Card title='Border Radius' size='small' style={{ marginBottom: '1.4rem' }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <h5>Top Right</h5>
                            <Form.Item name='borderTopRightRadius'>
                                <Input onFocus={handleFocus} onBlur={(e) => {
                                    e.persist();
                                    handleBlur(addUnit(e, 'px'))
                                }} addonAfter='px' />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <h5>Top Left</h5>
                            <Form.Item name='borderTopLeftRadius'>
                                <Input onFocus={handleFocus} onBlur={(e) => {
                                    e.persist();
                                    handleBlur(addUnit(e, 'px'))
                                }} addonAfter='px' />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <h5>Bottom Right</h5>
                            <Form.Item name='borderBottomRightRadius'>
                                <Input onFocus={handleFocus} onBlur={(e) => {
                                    e.persist();
                                    handleBlur(addUnit(e, 'px'))
                                }} addonAfter='px' />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <h5>Bottom Left</h5>
                            <Form.Item name='borderBottomLeftRadius'>
                                <Input onFocus={handleFocus} onBlur={(e) => {
                                    e.persist();
                                    handleBlur(addUnit(e, 'px'))
                                }} addonAfter='px' />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
                <Card title='Border' size='small' style={{ marginBottom: '1.4rem' }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <h5>Border width</h5>
                            <Form.Item name='borderWidth'>
                                <Select
                                    style={{ width: '100%' }}
                                    defaultValue="inherit"
                                    onFocus={handleFocus}
                                    onChange={(e) => {
                                        let event = {
                                            target: {
                                                id: 'borderWidth',
                                                value: e
                                            }
                                        }
                                        handleBlur(event);
                                    }}>
                                    <Option value="inherit">Inherit</Option>
                                    <Option value="thick">Thick</Option>
                                    <Option value="thin">Thin</Option>
                                    <Option value="medium">Medium</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <h5>Border Style</h5>
                            <Form.Item name='borderStyle'>
                                <Select
                                    style={{ width: '100%' }}
                                    defaultValue="solid"
                                    onFocus={handleFocus}
                                    onChange={(e) => {
                                        let event = {
                                            target: {
                                                id: 'borderStyle',
                                                value: e
                                            }
                                        }
                                        handleBlur(event);
                                    }}>
                                    <Option value="solid">Solid</Option>
                                    <Option value="dashed">Dashed</Option>
                                    <Option value="dotted">Dotted</Option>
                                    <Option value="double">Double</Option>
                                    <Option value="none">None</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <h5>Border Color</h5>
                    <Form.Item name='borderColor' onFocus={handleFocus} onBlur={handleBlur}>
                        <Input />
                    </Form.Item>

                </Card>
            </Form>
        </React.Fragment>
    )
}
