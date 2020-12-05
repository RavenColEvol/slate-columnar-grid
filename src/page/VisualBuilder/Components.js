import React, { useEffect, useState} from 'react'
import { Row, Col, Card, Breadcrumb } from 'antd';
import { useParams } from 'react-router-dom'
import { DndElement } from './DndComponentDrag'
import { getContentDetail } from './utils'


const getTemplate = (component, name = undefined, extras = {}) => {
    const { display_name } = component;
    return {
        type: 'paragraph',
        attrs: {
            field_attrs: {
                ...component
            },
            ...extras
        },
        children: [{
            text: `{{${name || display_name}}}`
        }]
    }
}

export const CardComponent = ({component}) => {
    return (
        <Col span={8} key={component.uid}>
            <DndElement template={getTemplate(component)}>
                <Card>
                    <div style={{textAlign:'center'}}>
                        <div className='material-icons' style={{fontSize: '48px'}}>{'text_fields'}</div>
                        <div style={{textTransform: 'capitalize'}}>{component.display_name}</div>
                    </div>
                </Card>
            </DndElement>
        </Col>
    )
}

export const ReferenceComponent = ({component}) => {
    return (
        <Col span={8} key={component.uid} >
            <DndElement template={getTemplate(component, component.reference_to[0], {
                data_type: 'reference'
            })}>
                <Card>
                    <div style={{textAlign:'center'}}>
                        <div className='material-icons' style={{fontSize: '48px'}}>{'link'}</div>
                        <div style={{textTransform: 'capitalize'}}>{component.reference_to[0]}</div>
                    </div>
                </Card>
            </DndElement>
        </Col>
    )
}

export const GenericComponent = ({component, children, icon, template}) => {
    return (
        <Col span={8} key={component.uid}>
            <DndElement template={getTemplate(component)}>
                <Card>
                    <div style={{textAlign:'center'}}>
                        <div className='material-icons' style={{fontSize: '48px'}}>{icon}</div>
                        <div style={{textTransform: 'capitalize'}}>{children}</div>
                    </div>
                </Card>
            </DndElement>
        </Col>
    )
}

export default function Components() {
    const { uid } = useParams();
    const [state, setState] = useState(null);
    useEffect(() => {
        getContentDetail(uid).then(res => {
            console.log(res);
            setState(res)
        })
    }, [uid])

    return (
        <React.Fragment>
            <Breadcrumb separator=">" style={{marginBottom: '1.4rem'}}>
                <Breadcrumb.Item>Content Types</Breadcrumb.Item>
                <Breadcrumb.Item style={{textTransform: 'capitalize'}}>{uid}</Breadcrumb.Item>
            </Breadcrumb>
            <Row gutter={[8,8]}>
                {state && state.schema.map(component => {
                    if(component.data_type === 'reference') {
                        return <ReferenceComponent key={component.uid} component={component}/>
                    }
                    else if(component.multiple) {
                        return <GenericComponent key={component.uid} component={component} icon='view_list' children={component.display_name}/>
                    }
                    else
                        return <CardComponent key={component.uid} component={component}/>
                })}
            </Row>
        </React.Fragment>
    )
}
