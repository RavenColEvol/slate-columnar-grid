import React from 'react';
import { Dropdown, Button, Menu } from 'antd';

export default function ({contentTypes, selected}) {
    console.log(selected, contentTypes[selected])
    const menu = (
        <Menu>
            {contentTypes.map(content => <Menu.Item key={content.title}>{content.title}</Menu.Item>)}
        </Menu>
    )
    return (
        <Dropdown overlay={menu}>
            <Button></Button>
        </Dropdown>
    )
}