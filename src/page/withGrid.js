import { Transforms, Node } from 'slate'

const withGrid = (editor) => {
    const { normalizeNode, apply } = editor;
    editor.normalizeNode = (entry) => {
        const [node, path] = entry;

        // column with no nodes gets deleted
        if (node.type === 'column' && node.children.length === 0) {
            let rowPath = path.slice(0, path.length - 1);
            let row = Node.get(editor, rowPath);
            let removingCol = Node.get(editor, path);
            let removingColWidth = removingCol?.meta?.width;
            let newColCount = row.children.length - 1;
            let widthToBeAdded = removingColWidth / (newColCount);

            Transforms.removeNodes(editor, {
                at: path
            })
            
            let updatedRow = Node.get(editor, rowPath);


            // first case: only single element left
            if(updatedRow.children.length === 1) {
                Transforms.unwrapNodes(editor, { at: rowPath })
                Transforms.unwrapNodes(editor, { at: rowPath })
                return;
            }
            // // more than one: add size
            if(updatedRow.children.length > 1) {
                for(let i = 0; i < newColCount; i++) {   
                    const currentColWidth = updatedRow.children[i].meta.width;
                    Transforms.setNodes(editor, {
                        meta: {
                            width: currentColWidth + widthToBeAdded
                        }
                    }, {
                        at: [...rowPath, i]
                    })
                }
                return;
            }

            
            return;
        }

        // row with only text gets deleted
        if (node.type === 'row' && node.children.length === 1 && node.children[0].text === '') {
            Transforms.removeNodes(editor, {
                at: path
            })
        }

        
        return normalizeNode(entry)
    }

    return editor;
}

export default withGrid