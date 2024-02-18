import { Link } from 'react-router-dom'
import { useAppContext } from './context/AppContextProvider'
import ExpandablePanel from './ExpandablePanel'
import DeleteIcon from './icons/DeleteIcon'
import EditIcon from './icons/EditIcon'
import FlagIcon from './icons/FlagIcon'
import HandleIcon from './icons/HandleIcon'
import './StopDetail.css'

const StopLabel = ({ children }) => <div className="px-1 text-sm text-gray-light pt-1">{children}</div>

const StopEdit = ({ stop, index, isStart, isEnd, onEdit, onDelete, onUseDefault, dragRef }) => {
    const { user } = useAppContext()
    const defaultStart = user.fleet?.start_persistent
    const defaultEnd = user.fleet?.end_persistent

    return (
        <div className="h-20 flex">
            <div className="pl-3 pt-1 w-5 text-gray-light">
                {!isEnd && !isStart && (
                    <div ref={dragRef}>
                        <HandleIcon />
                    </div>
                )}
            </div>
            <div className="border-navy relative w-14 pl-4 pr-3">
                {isStart && (
                    <div className="stop-icon--edit-start">
                        <FlagIcon />
                    </div>
                )}
                {isEnd && (
                    <div className="stop-icon--edit-end">
                        <FlagIcon />
                    </div>
                )}
                {index > -1 && (
                    <div className="stop-icon--edit">
                        <span>{index + 1}</span>
                    </div>
                )}
            </div>
            <div className="flex flex-1 pr-4 flex-col">
                {stop?.place_name ||
                    // Only display default fill options if the `onUseDefault` prop is present. This allows
                    // us to reuse StopEdit on the SetDefaultPointsPage and not provide the autofill options
                    // there (which would be confusing)
                    (onUseDefault && isStart && defaultStart && (
                        <button className="text-blue text-left" onClick={() => onUseDefault(defaultStart)}>
                            Use your default start point?
                            <div className="text-sm text-gray mt-1">({defaultStart.place_name})</div>
                        </button>
                    )) ||
                    (onUseDefault && isEnd && defaultEnd && (
                        <button className="text-blue text-left" onClick={() => onUseDefault(defaultEnd)}>
                            Use your default end point?
                            <div className="text-sm text-gray mt-1">({defaultEnd.place_name})</div>
                        </button>
                    )) ||
                    (onUseDefault && isStart && <Link to="/routes/default-points">Set a default start point</Link>) ||
                    (onUseDefault && isEnd && <Link to="/routes/default-points">Set a default end point</Link>)}
            </div>

            {isStart && <StopLabel>Start</StopLabel>}
            {isEnd && <StopLabel>End</StopLabel>}
            <div className="pr-4">
                {!isStart && !isEnd && (
                    <ExpandablePanel
                        panelItems={[
                            {
                                icon: <DeleteIcon />,
                                title: 'Delete stop',
                                onClick: () => onDelete(index),
                                color: 'red'
                            }
                        ]}
                    />
                )}
                {isStart && (
                    <ExpandablePanel
                        panelItems={[
                            {
                                icon: <EditIcon />,
                                title: 'Edit start',
                                onClick: () => onEdit('start')
                            },
                            {
                                icon: <DeleteIcon />,
                                title: 'Delete start',
                                onClick: () => onDelete('start'),
                                color: 'red'
                            }
                        ]}
                    />
                )}
                {isEnd && (
                    <ExpandablePanel
                        panelItems={[
                            {
                                icon: <EditIcon />,
                                title: 'Edit end',
                                onClick: () => onEdit('end')
                            },
                            {
                                icon: <DeleteIcon />,
                                title: 'Delete end',
                                onClick: () => onDelete('end'),
                                color: 'red'
                            }
                        ]}
                    />
                )}
            </div>
        </div>
    )
}

export default StopEdit
