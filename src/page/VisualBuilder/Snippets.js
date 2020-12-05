import React, { useMemo, useState } from 'react'
import { Card, Row, Col } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined, DeleteOutlined } from '@ant-design/icons';

import { DndElement } from './DndComponentDrag'

export default function Snippets() {

    let [snippets, setSnippets] = useState(JSON.parse(localStorage.getItem('snippets')) || {});

    const handleDelete = (key) => {
        
    } 

    const handleEdit = (key) => {

    }
    return (
        <Row gutter={8}>
            {Object.entries(snippets).map(([key, value]) => {
                console.log(key, value);
                return (
                    <Col span={8} key={key}>
                        <DndElement template={{...value}}>
                            <Card size='small' style={{textAlign:'center'}} 
                            actions={[
                                    <DeleteOutlined onClick={() => handleDelete(key)} key="ellipsis" style={{fontSize: '14px'}}/>,
                                    <EditOutlined onClick={() => handleEdit(key)} key="edit" style={{fontSize: '14px'}}/>,
                                ]}
                            >
                                <h1 style={{textTransform: 'capitalize'}}>{key}</h1>
                            </Card>
                        </DndElement>
                    </Col>
                )
            })}
        </Row>
    )
}
