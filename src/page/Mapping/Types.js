import React from 'react';
import { Select} from 'antd';

const {Option} = Select;

const types = [{
        type: 'paragraph',
        title: 'Paragraph'
    },
    {
        type: 'heading-one',
        title: 'Heading One'
    }
]

export default function() {
    return (
        <Select defaultValue={'paragraph'}>
            {types.map(el => <Option key={el.type} value={el.type}>{el.title}</Option>)}
        </Select>
    )
}