import React, { useEffect } from 'react'
import { Form, Input, Row, Col, Select} from 'antd'

const { Option } = Select;

export const ParagraphForm = ({saveCSS, type, initialValues}) => {
    const [form] = Form.useForm();
    let className = `scrte_${type}`

    useEffect(() => {
        form.setFieldsValue(initialValues)
    }, [initialValues])

    return (
        <Form form={form}>
            <Row style={{marginBottom:'1.4rem'}}>
                <Col span={24}>
                    <h5>Font Family</h5>
                    <Form.Item name='font-family'>
                        <Select 
                        style={{width: '100%'}}
                        defaultValue="inherit" 
                        onChange={(e) => {
                            let event = {
                                target: {
                                    id: 'font-family',
                                    value: e
                                }
                            }
                            saveCSS(className, event)
                        }}>
                            <Option value="inherit">Default</Option>
                            <Option value="cursive">Cursive</Option>
                            <Option value="monospace">Monospace</Option>
                            <Option value="sans-serif">Sans-serif</Option>
                            <Option value="serif">Serif</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={8}>
                    <h5>Font Size</h5>
                    <Form.Item
                        name='font-size'
                    >
                        <Input
                            addonAfter="px"
                            onBlur={(e) => {
                                e.persist();
                                e.target.value = e.target.value + "px"
                                saveCSS(className, e)
                            }
                            } />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <h5>Font Weight</h5>
                    <Form.Item
                        name='font-weight'
                    >
                        <Select defaultValue="400" onChange={(e) => {
                            let event = {
                                target: {
                                    id: 'font-weight',
                                    value: e
                                }
                            }
                            saveCSS(className, event)
                        }}>
                            <Option value="300">300 (Thin)</Option>
                            <Option value="400">400 (Normal)</Option>
                            <Option value="700">700 (Bold)</Option>
                        </Select>
                        
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <h5>Line Height</h5>
                    <Form.Item
                        
                        name='line-height'
                    >
                        <Input 
                        addonAfter='%'
                        onBlur={(e) => {
                            e.persist();
                            e.target.value = e.target.value + "%"
                            saveCSS(className, e)
                        }
                        } />
                    </Form.Item>
                </Col>
            </Row>
            
            <Row gutter={16}>
                <Col span={12}>
                    <h5>Text Case</h5>
                    <Form.Item
                        name='text-transform'
                    >
                        <Select defaultValue="regular" onChange={(e) => {
                            let event = {
                                target: {
                                    id: 'text-transform',
                                    value: e
                                }
                            }
                            saveCSS(className, event)
                        }}>
                            <Option value="regular">Regular</Option>
                            <Option value="uppercase">Uppercase</Option>
                            <Option value="lowercase">lowercase</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <h5>Letter Spacing</h5>
                    <Form.Item
                        name='letter-spacing'
                    >
                        <Input
                        addonAfter='px'
                        onBlur={(e) => {
                            e.persist();
                            e.target.value = e.target.value + "px"
                            saveCSS(className, e)
                        }
                        } />
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    )
}