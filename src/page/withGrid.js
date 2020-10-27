import { Transforms, Node } from 'slate'

const withGrid = (editor) => {
    const { normalizeNode, apply } = editor;
    editor.normalizeNode = (entry) => {
        const [node, path] = entry;


        if(node.type === 'column' && node.meta.width === 1) {
            let rowPath = path.slice(0, path.length - 1);
            Transforms.unwrapNodes(editor, { at: rowPath })
            Transforms.unwrapNodes(editor, { at: rowPath })
            return;
        }
        // column with no nodes gets deleted
        if (node.type === 'column' && node.children.length === 0) {
            let rowPath = path.slice(0, path.length - 1);

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
            // if(updatedRow.children.length > 1) {
            //     for(let i = 0; i < newColCount; i++) {   
            //         const currentColWidth = updatedRow.children[i].meta.width;
            //         Transforms.setNodes(editor, {
            //             meta: {
            //                 width: currentColWidth + widthToBeAdded
            //             }
            //         }, {
            //             at: [...rowPath, i]
            //         })
            //     }
            // }

            
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

    editor.apply = operation => {
        if(operation.type === 'remove_node' && operation.node.type === 'column') {
            let {node, path} = operation;
            let pathLength = path.length;
            let rowPath = path.slice(0, pathLength - 1);
            let row = Node.get(editor, rowPath);
            if(row.type === 'row') {
                let removingCol = Node.get(editor, path);
                let removingColWidth = removingCol?.meta?.width;
                let newColCount = row.children.length - 1;
                let widthToBeAdded = removingColWidth / (newColCount);

                row.children.forEach((child, index) => {
                    if(child.children.length !== 0) {
                        console.log(child)
                        Transforms.setNodes(editor, {
                            meta: {
                                width: child.meta.width + widthToBeAdded
                            }
                        }, {
                            at: rowPath.concat(index)
                        })
                    }
                })
            }
        }
        return apply(operation);
    }

    return editor;
}

export default withGrid