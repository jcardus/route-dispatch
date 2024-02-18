import { useRef, Children, cloneElement } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

const DragListItem = ({ index, moveStop, children }) => {
    const dragRef = useRef(null)
    const previewRef = useRef(null)

    const [{ handlerId }, drop] = useDrop({
        accept: 'box',
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId()
            }
        },
        hover(item, monitor) {
            if (!previewRef.current) {
                return
            }
            const dragIndex = item.index
            const hoverIndex = index
            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return
            }
            // Only perform the move when the mouse has crossed half of the items height
            const hoverBoundingRect = previewRef.current ? previewRef.current.getBoundingClientRect() : null
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
            const clientOffset = monitor.getClientOffset()
            const hoverClientY = clientOffset.y - hoverBoundingRect.top
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return
            }
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return
            }
            // perform reorder
            moveStop(dragIndex, hoverIndex)
            item.index = hoverIndex
        }
    })
    const [{ isDragging }, drag, preview] = useDrag({
        type: 'box',
        item: () => {
            return { index }
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    })

    drag(dragRef)
    drop(preview(previewRef))

    const draggingClass = isDragging ? 'opacity-50' : ''
    const child = Children.only(children)

    return (
        <li className={draggingClass} data-handler-id={handlerId} ref={previewRef}>
            {cloneElement(child, { dragRef })}
        </li>
    )
}

const DragList = ({ onDrop, children }) => {
    return (
        <DndProvider backend={HTML5Backend}>
            <ol>
                {Children.toArray(children).map((child, i) => (
                    <DragListItem key={i} moveStop={onDrop} index={i}>
                        {child}
                    </DragListItem>
                ))}
            </ol>
        </DndProvider>
    )
}

export default DragList
