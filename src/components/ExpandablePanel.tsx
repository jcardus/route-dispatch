import { useState } from 'react'
import './ExpandablePanel.css'
import MoreIcon from './icons/MoreIcon'

interface ExpandablePanelProps {
    children?: any
    panelItems: PanelItemProps[]
}

interface PanelItemProps {
    icon: JSX.Element
    title: string
    disabled?: boolean
    color?: string
    onClick: () => void
}
const ExpandablePanel = ({ children, panelItems }: ExpandablePanelProps) => {
    const [isExpanded, setIsExpanded] = useState(false)

    const PanelButton = ({ icon, title, disabled, onClick, color }: PanelItemProps) => {
        const buttonClick = () => {
            setIsExpanded(false)
            onClick()
        }

        return (
            <button
                className={`flex items-center flex-nowrap px-3 py-2 ${
                    disabled ? 'opacity-30' : 'hover:bg-blue-light'
                } w-full`}
                disabled={disabled}
                onClick={buttonClick}
            >
                <div className={`${color ? `text-${color}` : 'text-blue'}`}>{icon}</div>
                <div className={`whitespace-nowrap font-sm py-1 px-2 ${color ? `text-${color}` : 'text-gray'}`}>
                    {title}
                </div>
            </button>
        )
    }

    const PanelLinks = ({ panelItems }: { panelItems: PanelItemProps[] }) => (
        <ul>
            {panelItems.map((item, i) => (
                <li className="panel-link" key={i}>
                    <PanelButton {...item} />
                </li>
            ))}
        </ul>
    )

    const panelClass = isExpanded ? 'block' : 'hidden'
    const panelTriggerClasses = children ? [] : ['px-2', 'py-1', 'hover:bg-gray-lighter', 'rounded']
    if (isExpanded) {
        panelTriggerClasses.push('panel-background-active')
    }

    return (
        <div className="relative text-gray-light">
            <button className={panelTriggerClasses.join(' ')} onClick={() => setIsExpanded(!isExpanded)}>
                {children || <MoreIcon />}
            </button>
            <div
                className={`absolute top-full right-0 bg-white border border-gray-lighter rounded z-50 shadow ${panelClass}`}
            >
                <PanelLinks panelItems={panelItems} />
            </div>
        </div>
    )
}

ExpandablePanel.defaultProps = {
    children: undefined
}

export default ExpandablePanel
