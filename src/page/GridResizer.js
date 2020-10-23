import React, { useRef, useEffect } from 'react'
import { ReactEditor } from 'slate-react'
import { Transforms, Node } from 'slate'

import './style.css'
const minWidth = 20
export default (props) => {
    const { editor, element } = props
    let pageX, curCol, curColWidth, nxtCol, nxtColWidth, slatePath, iCurColWidth, iNxtColWidth;
    const divRef = useRef(null)
    useEffect(() => {
        function resizer(e) {
            e.preventDefault()
            if (curCol) {
                const diff = e.pageX - pageX
                if (minWidth >= curColWidth + diff || (nxtColWidth && minWidth >= nxtColWidth - diff)) {
                    return
                }
                slatePath = ReactEditor.findPath(editor, element)
                if (!slatePath) {
                    return
                }
                if(nxtCol)  {
                    nxtCol.style.width = `${nxtColWidth - diff}px`
                    iNxtColWidth = nxtColWidth - diff;
                }   
                curCol.style.width = `${curColWidth + diff}px`;
                iCurColWidth = curColWidth + diff;
            }
        }
        function resizerHandler(e) {
            e.preventDefault();
            curCol = e.target.parentElement;
            pageX = e.pageX
            curColWidth = curCol.offsetWidth
            nxtCol = e.target.parentElement.nextElementSibling
            // if (nxtCol.getAttribute('data-drag')) {
            //     nxtCol = undefined
            // }
            if (nxtCol) {
                nxtColWidth = nxtCol.offsetWidth
            }
            
            window.addEventListener('mousemove', resizer, true)
            window.addEventListener('mouseup', stopResizer, true)
        }
        function stopResizer(e) {
            e.preventDefault()
            curCol = undefined;
            pageX = undefined;
            curColWidth = undefined;
            nxtColWidth = undefined
            nxtCol = undefined
            const row = Node.get(editor, slatePath.slice(0, slatePath.length - 1))
            const rowDom = ReactEditor.toDOMNode(editor, row);
            const rowWidth = rowDom.offsetWidth;
            Transforms.setNodes(editor, {
                meta: {
                    width: iCurColWidth / rowWidth
                }
            }, { at: slatePath })

            if(iNxtColWidth) {
                slatePath[slatePath.length - 1]++;
                Transforms.setNodes(editor, {
                    meta: {
                        width: iNxtColWidth / rowWidth
                    }
                }, { at: slatePath })
            }

            window.removeEventListener('mousemove', resizer, true);
            window.removeEventListener('mouseup', stopResizer, true);
        }
        divRef.current.addEventListener('mousedown', resizerHandler, true)
        return () => {
            window.removeEventListener('mousemove', resizer, true)
            window.removeEventListener('mouseup', stopResizer, true)
            divRef.current.removeEventListener('mousedown', resizerHandler, true)
        }
    }, [element])

    return (
        <React.Fragment>
            <div contentEditable={false} ref={divRef} className={'table-resizer'}></div>
        </React.Fragment>
    )
}