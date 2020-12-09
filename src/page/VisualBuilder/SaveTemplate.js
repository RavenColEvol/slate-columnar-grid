import React, { useState } from 'react';
import { useEditor } from 'slate-react';
import { useParams } from 'react-router-dom';
import { Button, Modal, Form, Input } from 'antd'
import { set, get } from 'idb-keyval';


export const SaveTemplate = () => {
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const { uid, visualPageId } = useParams();
    
    const toggleModal = () => setOpen(!open);
    const editor = useEditor();
    const handleOk = () => {
        let inputValue = form.getFieldValue('name');
        get('list')
            .then(res => {
                let pagesForUid = res?.[uid] || {};
                console.log(res, pagesForUid, visualPageId)
                set('list', { ...res, [uid]: {...pagesForUid, [visualPageId]: { name: inputValue, json: editor.children}}});
            })
            .catch(err => {
                console.log(err);
            });
        form.resetFields();
        toggleModal();
    }
    return (
        <React.Fragment>
            <Button type='primary' onClick={toggleModal}>Save Visual Page</Button>
            <Modal visible={open} onCancel={toggleModal} onOk={handleOk} okText='Save' title='Snippet'>
                <Form form={form}>
                    <Form.Item name='name'>
                        <Input></Input>
                    </Form.Item>
                </Form>
            </Modal>
        </React.Fragment>
    )
}