import { Transforms } from 'slate'

export const withModal = editor => {
    editor.modalOpen = false;
    return editor;
}

