import { DriverStatuses } from '../modules/drivers'
import { RouteStatuses } from '../modules/routes'
import AvailableIcon from './icons/AvailableIcon'
import CompletedIcon from './icons/CompletedIcon'
import DispatchedIcon from './icons/DispatchedIcon'
import DraftIcon from './icons/DraftIcon'
import InProgressIcon from './icons/InProgressIcon'

const routeStatusContent = {
    [RouteStatuses.DRAFT]: {
        icon: <DraftIcon />,
        color: 'gray-light'
    },
    [RouteStatuses.DISPATCHED]: {
        icon: <DispatchedIcon />,
        color: 'blue'
    },
    [RouteStatuses.IN_PROGRESS]: {
        icon: <InProgressIcon />,
        color: 'green'
    },
    [RouteStatuses.COMPLETE]: {
        icon: <CompletedIcon />,
        color: 'gray'
    }
}

const driverStatusContent = {
    [DriverStatuses.AVAILABLE]: {
        icon: <AvailableIcon />,
        color: 'green'
    },
    [DriverStatuses.DISPATCH_ASSIGNED]: {
        icon: <InProgressIcon />,
        color: 'blue'
    }
}

const StatusLabel = (
    content: typeof routeStatusContent | typeof driverStatusContent,
    status: string,
    text?: string
) => (
    <div className={`flex items-center text-${content[status].color}`}>
        <div>{content[status].icon}</div>
        <div className="ml-1">{text || status}</div>
    </div>
)

export const RouteStatusLabel = ({ status, text }: { status: string; text?: string }) =>
    StatusLabel(routeStatusContent, status, text)

export const DriverStatusLabel = ({ status, text }: { status: string; text?: string }) =>
    StatusLabel(driverStatusContent, status, text)
