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
    
    const [, gridDropRight] = useDrop({
        accept: 'any',
        drop: (item, monitor) => {
            const path = ReactEditor.findPath(editor, element)
            const [pathMatch] = Editor.nodes(editor, {
                at: path,
                match: n => n.type === 'row'
            })
            const elementPath = ReactEditor.findPath(editor, item.element)

            const [elementPathMatch] = Editor.nodes(editor, {
                at: elementPath,
                match: n => n.type === 'row'
            })
            
            

            const isContainer = !!pathMatch;
            const elementContainerMatch = !!elementPathMatch;
            
            if(JSON.stringify(path.slice(0, path.length - 2)) === JSON.stringify(elementPath.slice(0, elementPath.length - 2)) && (isContainer && elementContainerMatch))
            {
                /**
                 * case 1: part of column as new column
                 */

                if(elementPath[elementPath.length - 1] !== 0) {
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
                    return ;
                }

                /**
                 * case 2: whole column is dnd
                 */
                Transforms.moveNodes(editor, {
                    at: elementPath.slice(0, elementPath.length - 1),
                    to: [...path.slice(0, path.length - 2), path[path.length-2] + 1]
                })
                return;
            }
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
    </React.Fragment>)
}


/*

*/

export {
    GridDrop
}