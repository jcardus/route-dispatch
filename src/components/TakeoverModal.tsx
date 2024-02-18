import { ReactNode } from 'react'

const TakeoverModal = ({
    disableBackground,
    wrapContent,
    children
}: {
    disableBackground: boolean
    wrapContent: boolean
    children: ReactNode
}) => {
    const modalBgClass = disableBackground
        ? 'absolute inset-0 overflow-y-auto h-full w-full'
        : 'fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50'
    const modalContainerClass = `absolute border border-gray-light top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-5 rounded bg-white ${
        wrapContent ? 'table w-0' : ''
    }`

    return (
        <div className={modalBgClass}>
            <div className={modalContainerClass}>{children}</div>
        </div>
    )
}

TakeoverModal.defaultProps = {
    disableBackground: false,
    wrapContent: false
}

export default TakeoverModal
