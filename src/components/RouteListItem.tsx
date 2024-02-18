import { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { SpinnerCircular } from 'spinners-react'
import { RouteStatuses } from '../modules/routes'
import { isToday, isYesterday } from '../modules/utils/dateUtil'
import getErrorMessage from '../modules/utils/getErrorMessage'
import { Route } from '../types/Models'
import { useDataContext } from './context/DataContextProvider'
import ExpandablePanel from './ExpandablePanel'
import FedexLabel from './FedexLabel'
import DeleteIcon from './icons/DeleteIcon'
import DriversIcon from './icons/DriversIcon'
import EditIcon from './icons/EditIcon'
import InProgressIcon from './icons/InProgressIcon'
import { RouteStatusLabel } from './StatusLabels'
import UserLabel from './UserLabel'

interface RouteListItemProps {
    route: Route
}

const RouteListItem = ({ route }: RouteListItemProps) => {
    const history = useHistory()
    const { deleteRoute, deleteDispatch, getRouteStatus, getDriverById, getDispatchByRouteId } = useDataContext()
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>()

    const handleDispatch = (routeId: string) => {
        history.push(`/routes/${routeId}/dispatch`)
    }

    const handleEdit = (routeId: string) => {
        history.push(`/routes/${routeId}/edit`)
    }

    const handleViewDispatch = (routeId: string) => {
        const dispatch = getDispatchByRouteId(routeId)
        if (!dispatch) {
            setErrorMessage('Could not load dispatch. Please refresh the page and try again.')
            return
        }

        history.push(`/dispatches/${dispatch.id}`)
    }

    const handleDeleteRoute = (routeId: string) => {
        async function del() {
            if (loading) return
            setLoading(true)
            try {
                await deleteRoute(routeId)
                history.push('/routes')
            } catch (err) {
                setErrorMessage(getErrorMessage(err))
            } finally {
                setLoading(false)
            }
        }
        setErrorMessage(null)
        del()
    }

    const handleDeleteDispatch = async (routeId: string) => {
        setErrorMessage(null)
        if (loading) {
            return
        }

        const dispatch = getDispatchByRouteId(routeId)
        if (!dispatch) {
            setErrorMessage('Could not delete dispatch. Please refresh the page and try again.')
            return
        }

        setLoading(true)
        try {
            await deleteDispatch(dispatch.id)
            history.push('/routes')
        } catch (err) {
            setErrorMessage(getErrorMessage(err))
        } finally {
            setLoading(false)
        }
    }

    const routeDateString = () => {
        try {
            const format = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format
            return format(new Date(route.created_at))
        } catch (error) {
            return ''
        }
    }

    const routeStatus = getRouteStatus(route)
    const dispatch = getDispatchByRouteId(route.id)
    const driver = route.dispatch_to ? getDriverById(route.dispatch_to) : null
    const routeCreatedDate = new Date(route.created_at)

    return (
        <>
            {errorMessage && (
                <tr>
                    <td colSpan={6}>
                        <p className="text-md px-4 pt-1 font-semibold text-red">{errorMessage}</p>
                    </td>
                </tr>
            )}
            <tr className="border-b border-gray-lighter h-16 hover:bg-blue-light">
                <td className="pl-4 py-4">
                    {
                        <Link
                            to={
                                dispatch && routeStatus !== RouteStatuses.DRAFT
                                    ? `/dispatches/${dispatch.id}`
                                    : `/routes/${route.id}`
                            }
                        >
                            <div className="flex flex-col text-gray-dark">
                                {routeCreatedDate && !isToday(routeCreatedDate) && !isYesterday(routeCreatedDate) && (
                                    <span className="text-gray">{routeDateString()}</span>
                                )}
                                <span className="font-semibold">{route.title}</span>
                            </div>
                        </Link>
                    }
                </td>
                <td className="pl-4">
                    <RouteStatusLabel
                        status={routeStatus}
                        text={
                            (routeStatus == RouteStatuses.IN_PROGRESS &&
                                dispatch &&
                                `${routeStatus} (${dispatch.stops.filter((s) => s.completed_at).length}/${
                                    route.stops.length
                                })`) ||
                            undefined
                        }
                    />
                </td>
                <td className="pl-4">
                    {(route.created_via === 'SYNC_FEDEX' && <FedexLabel name="FedEx Sync" />) ||
                        (route.created_by_user && <UserLabel initialsProviding={route.created_by_user} />)}
                </td>
                <td className="pl-4">{driver && <UserLabel initialsProviding={driver} />}</td>
                <td className="pl-4">{route.stops.length}</td>
                <td className="pr-10">
                    {loading ? (
                        <SpinnerCircular size={20} />
                    ) : (
                        <ExpandablePanel
                            panelItems={
                                routeStatus == RouteStatuses.DRAFT
                                    ? [
                                          {
                                              icon: <DriversIcon />,
                                              title: 'Dispatch',
                                              onClick: () => handleDispatch(route.id)
                                          },
                                          {
                                              icon: <EditIcon />,
                                              title: 'Edit route',
                                              onClick: () => handleEdit(route.id)
                                          },
                                          {
                                              icon: <DeleteIcon />,
                                              title: 'Delete route',
                                              onClick: () => handleDeleteRoute(route.id),
                                              color: 'red'
                                          }
                                      ]
                                    : [
                                          {
                                              icon: <InProgressIcon />,
                                              title: 'View Progress',
                                              onClick: () => handleViewDispatch(route.id)
                                          },
                                          {
                                              icon: <DeleteIcon />,
                                              title: 'Delete dispatch',
                                              onClick: () => handleDeleteDispatch(route.id),
                                              color: 'red'
                                          }
                                      ]
                            }
                        />
                    )}
                </td>
            </tr>
        </>
    )
}

export default RouteListItem
