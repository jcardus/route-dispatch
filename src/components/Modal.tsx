import { ReactNode, useCallback, useEffect, useState } from 'react'

interface ModalProps {
    expandedOnLoad: boolean
    onClose?: () => void
    allowsDismissViaBackground?: boolean
    bgColor?: string
    wrapContent?: boolean
    containerClassName?: string
    children: ReactNode
}
const Modal = ({
    expandedOnLoad,
    onClose,
    allowsDismissViaBackground,
    bgColor,
    wrapContent,
    containerClassName,
    children
}: ModalProps) => {
    const [isExpanded, _setIsExpanded] = useState(expandedOnLoad)
    const setIsExpanded = useCallback(
        (newIsExpanded: boolean) => {
            if (!newIsExpanded && onClose) {
                onClose()
            }
            _setIsExpanded(newIsExpanded)
        },
        [_setIsExpanded, onClose]
    )
    const modalBgClass = 'fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50'
    const modalContainerClass = `absolute border border-gray-light top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-5 rounded ${
        bgColor || 'bg-white'
    } ${wrapContent ? 'table w-0' : ''} ${containerClassName || ''}`

    useEffect(() => {
        const keyDownHandler = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && allowsDismissViaBackground) {
                event.preventDefault()
                setIsExpanded(false)
            }
        }

        document.addEventListener('keydown', keyDownHandler)

        // clean up event listener
        return () => {
            document.removeEventListener('keydown', keyDownHandler)
        }
    }, [allowsDismissViaBackground, setIsExpanded])

    return (
        <div className={`${isExpanded ? '' : 'hidden'} ${modalBgClass}`}>
            <div
                className="absolute h-full w-full cursor-default"
                onClick={allowsDismissViaBackground ? () => setIsExpanded(false) : () => {}}
                role="button"
                tabIndex={0}
            />
            <div className={modalContainerClass}>{children}</div>
        </div>
    )
}

Modal.defaultProps = {
    allowsDismissViaBackground: true
}

export default Modal
