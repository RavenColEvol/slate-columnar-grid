import React, { useEffect, useState } from 'react';
import { Dropdown, Button, Menu } from 'antd';

import { getContentTypes } from './utils'
import Schema from './Schema';


export default function Visual() {
    const [contentTypes, setContentTypes] = useState([]);
    const [selected, setSelected] = useState(undefined);

    useEffect(() => {
        getContentTypes().then(res => {
            setContentTypes(res['content_types'] || [])
        });
    }, [])

    const handleClick = (index) => {
        setSelected(index);
    }

    const menu = (
        <Menu>
            {contentTypes.map((content, index) => <Menu.Item onClick={() => handleClick(index)} key={content.title}>{content.title}</Menu.Item>)}
        </Menu>
    )

    return (
        <React.Fragment>
            <Dropdown overlay={menu} ><Button>Hello</Button></Dropdown>
            <Button type='primary'>Save</Button>
            {
                selected !== undefined && <Schema content={contentTypes[selected]}/>
            }
        </React.Fragment>
    )
}