import React, { useEffect } from 'react';
import { Card, Form, Row, Col, Select, Input, InputNumber } from 'antd'

const { Option } = Select;

export const LinkForm = ({ saveCSS }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        const custom_style = 'custom_style';
        const current_theme = 'general';
        let globalStyles = JSON.parse(localStorage.getItem(custom_style)) || {};
        if(globalStyles[current_theme] && globalStyles[current_theme]['desktop'] && globalStyles[current_theme]['desktop']['scrte_a']) {
            form.setFieldsValue(globalStyles[current_theme]['desktop']['scrte_a']);
        }
    }, [])

    return (
        <React.Fragment>
            <h2 style={{ marginTop: '24px' }}>Links</h2>
            <Card>
                <Form form={form}>
                    <Row style={{ marginBottom: '1.4rem' }}>
                        <Col span={24}>
                            <h5>Text decoration</h5>
                            <Form.Item name='text-decoration'>
                                <Select
                                    style={{ width: '100%' }}
                                    defaultValue="none"
                                    onChange={(e) => {
                                        let event = {
                                            target: {
                                                id: 'text-decoration',
                                                value: e
                                            }
                                        }
                                        saveCSS('scrte_a', event)
                                    }}>
                                    <Option value="none">None</Option>
                                    <Option value="underline">Underline</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <h5>Text transform</h5>
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
                                    saveCSS('scrte_a', event)
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
                                    saveCSS('scrte_a', e)
                                }
                                } />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </React.Fragment>
    )
}