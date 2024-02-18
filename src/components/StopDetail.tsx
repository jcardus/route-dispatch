import { ReactNode } from 'react'
import { getTimeWindowRange } from '../modules/utils/getTimeWindowRange'
import { Stop, StopStatus } from '../types/Models'
import CompletedCircleIcon from './icons/CompletedCircleIcon'
import FlagIcon from './icons/FlagIcon'
import MissedCircleIcon from './icons/MissedCircleIcon'
import TimeWindowIcon from './icons/TimeWindowIcon'
import './StopDetail.css'

const StopLabel = ({ children }: { children: ReactNode }) => (
    <div className="px-1 text-sm text-gray-light flex items-center">{children}</div>
)

const TimeWindowLabel = ({ timeWindow }: { timeWindow: NonNullable<Stop['time_window']> }) => (
    <div className="flex flex-row items-center">
        <TimeWindowIcon />
        <div className="px-1 text-sm text-gray-light font-medium">{getTimeWindowRange(timeWindow)}</div>
    </div>
)

const StopDetail = ({
    stop,
    number,
    isStart,
    isEnd
}: {
    stop?: Stop
    number?: number
    isStart: boolean
    isEnd: boolean
}) => {
    const title = stop && stop.place_name && stop.place_name.split(',')[0]
    const detail =
        stop &&
        stop.address_parsed &&
        `${stop.address_parsed.city}, ${stop.address_parsed.state} ${stop.address_parsed.postal_code}`

    let borderClass = 'stop-line'
    if (stop?.status === 'COMPLETED') {
        borderClass += '--complete'
    } else if (stop?.status === 'MISSED') {
        borderClass += '--missed'
    } else if (isEnd) {
        borderClass = ''
    }

    return (
        <div className="h-16 flex">
            <div className={`w-7 mr-8 border-navy relative ${borderClass}`}>
                {isStart && (
                    <div className="stop-icon--start">
                        <FlagIcon />
                    </div>
                )}
                {isEnd && (
                    <div className="stop-icon--end">
                        <FlagIcon />
                    </div>
                )}
                {number && stop && getCircleIcon(number, stop.status)}
            </div>
            <div className="flex-1 pr-4" title={stop?.id}>
                <div className="text-black">{title}</div>
                <div className="text-sm text-gray">{detail}</div>
            </div>
            <div className="pr-4 pt-1">
                {isStart && <StopLabel>Start</StopLabel>}
                {isEnd && <StopLabel>End</StopLabel>}
                {stop?.time_window && <TimeWindowLabel timeWindow={stop.time_window} />}
            </div>
        </div>
    )
}

function getCircleIcon(number: number, status: StopStatus): ReactNode {
    switch (status) {
        case 'COMPLETED':
            return (
                <div className="stop-icon--complete">
                    <CompletedCircleIcon />
                </div>
            )
        case 'MISSED':
            return (
                <div className="stop-icon--missed">
                    <MissedCircleIcon />
                </div>
            )

        default:
            return (
                <div className="stop-icon">
                    <span>{number}</span>
                </div>
            )
    }
}

StopDetail.defaultProps = {
    isStart: false,
    isEnd: false,
    number: undefined
}

export default StopDetail
