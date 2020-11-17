import React from 'react';
import { Card, Form, Row, Col, Select, Input, InputNumber } from 'antd'

const { Option } = Select;

export const DividerForm = ({ saveCSS }) => {
    return (
        <React.Fragment>
            <h2 style={{ marginTop: '24px' }}>Links</h2>
            <Card>
                <Form>
                    <Row style={{ marginBottom: '1.4rem' }}>
                        <Col span={24}>
                            <h5>Text decoration</h5>
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
                                    saveCSS('scrte_p', event)
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