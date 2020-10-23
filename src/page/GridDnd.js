import React from 'react'
import { Transforms, Editor, Node } from 'slate'
import { useDrop } from 'react-dnd'
import { ReactEditor } from 'slate-react'

const makeColumn = (editor, path, width) => {
    Transforms.wrapNodes(editor, {
        type: 'column',
        meta: {
            width
        },
        children: []
    }, { 
        at: path
    })
}

const makeRow = (editor, path) => {
    Transforms.wrapNodes(editor, {
        type: 'row',
        children: []
    }, { 
        at: path
    })
}


function GridDrop({ editor, element }) {
    const path = ReactEditor.findPath(editor, element)

    const [, gridDropLeft] = useDrop({
        accept: 'any',
        drop: (item, monitor) => {
            const [match] = Editor.nodes(editor, {
                at: path,
                match: n => n.type === 'row'
            })
            
            const elementPath = ReactEditor.findPath(editor, item.element)
            const from = Node.get(editor, elementPath);
            const to = Node.get(editor, path);

            const isContainer = !!match;
            if (!isContainer) {           
                makeColumn(editor, path, 0.5)
                makeRow(editor, path)   
                Transforms.insertNodes(editor, {
                    type: 'column',
                    meta: {
                        width: 0.5,
                    },
                    children: [from]
                }, { at: path.concat(0) })
                Transforms.removeNodes(editor, { at: elementPath })
            }
            else {
                const atPath = path.splice(0, path.length-1)
                const rowPath = atPath.slice(0, atPath.length - 1)
                const row = Node.get(editor, rowPath)
                const columnCount = row.children.length + 1;
                const newColWidthRatio = 1 / columnCount;
                for(let i = 0; i < columnCount - 1; i++) {
                    
                    const currentColWidth = row.children[i].meta.width;
                    Transforms.setNodes(editor, {
                        meta: {
                            width: currentColWidth * newColWidthRatio * (columnCount - 1)
                        }
                    }, {
                        at: [...rowPath, i]
                    })
                }
                Transforms.insertNodes(editor, {
                    type: 'column',
                    meta: {
                        width: newColWidthRatio,
                    },
                    children: [Object.assign({}, from)]
                }, {
                    at: atPath
                })
                setTimeout(() => {
                    Transforms.removeNodes(editor, {
                        at: ReactEditor.findPath(editor, item.element)
                    })
                }, 0)
            }
        }
    })
    
    const [, gridDropRight] = useDrop({
        accept: 'any',
        drop: (item, monitor) => {
            const [match] = Editor.nodes(editor, {
                at: path,
                match: n => n.type === 'row'
            })
            
            const elementPath = ReactEditor.findPath(editor, item.element)
            const from = Node.get(editor, elementPath);

            const isContainer = !!match;
            if (!isContainer) {           
                makeColumn(editor, path, 0.5)
                makeRow(editor, path)   
                Transforms.insertNodes(editor, {
                    type: 'column',
                    meta: {
                        width: 0.5,
                    },
                    children: [{ text: ''}]
                }, { at: path.concat(1) })
                Transforms.moveNodes(editor,{ at: elementPath, to: path.concat(1).concat(0) })
            }
            else {
                const atPath = path.splice(0, path.length-1)
                atPath[atPath.length-1]++;
                const rowPath = atPath.slice(0, atPath.length - 1)
                const row = Node.get(editor, rowPath)
                const columnCount = row.children.length + 1;
                const newColWidthRatio = 1 / columnCount;
                for(let i = 0; i < columnCount - 1; i++) {   
                    const currentColWidth = row.children[i].meta.width;
                    Transforms.setNodes(editor, {
                        meta: {
                            width: currentColWidth * newColWidthRatio * (columnCount - 1)
                        }
                    }, {
                        at: [...rowPath, i]
                    })
                }
                Transforms.insertNodes(editor, {
                    type: 'column',
                    meta: {
                        width: newColWidthRatio,
                    },
                    children: [{text : ''}]
                }, {
                    at: atPath
                })
                Transforms.moveNodes(editor, {
                    to: atPath.concat(0),
                    at: elementPath
                })
            }
        }
    })
    return (
    <React.Fragment>
        <div contentEditable='false' ref={gridDropRight} className='new-col-right'></div>
        <div contentEditable='false' ref={gridDropLeft} className='new-col-left'></div>
    </React.Fragment>)
}


/*

*/

export {
    GridDrop
}