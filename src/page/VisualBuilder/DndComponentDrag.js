import React, { useEffect, useRef } from 'react'
import { useDrag } from 'react-dnd'

export const DndElement = (props) => {
    const accept = 'docs'
    const { children, template } = props;
    const [{ isDragging }, drag, preview] = useDrag({
        item: {
            type: accept,
            template
        }
    })

    return (
        <div ref={drag} style={{cursor: 'grab'}}>
            {children}
        </div>
    )
}