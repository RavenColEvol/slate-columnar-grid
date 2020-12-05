import React, { useState } from 'react';
import { useEditor } from 'slate-react';
import { Button, Modal, Form, Input } from 'antd'


export const SaveTemplate = () => {
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const toggleModal = () => setOpen(!open);
    const editor = useEditor();
    const handleOk = () => {
        let snippets = localStorage.getItem('snippets') || {};
        let snippetName = form.getFieldValue('name');
        snippets[snippetName] = {
            type: 'layout',
            children: editor.children
        };
        localStorage.setItem('snippets', JSON.stringify(snippets));
        form.resetFields();
        toggleModal();
    }
    return (
        <React.Fragment>
            <Button type='primary' onClick={toggleModal}>Save Snippet</Button>
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