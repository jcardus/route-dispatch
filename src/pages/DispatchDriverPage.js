import { useState } from 'react'
import { Helmet } from 'react-helmet'
import { Link, useHistory, useParams } from 'react-router-dom'
import { useDataContext } from '../components/context/DataContextProvider'
import DriverListItem from '../components/DriverListItem'
import ArrowIcon from '../components/icons/ArrowIcon'
import Modal from '../components/Modal'
import { track } from '../modules/apis/segment'
import { getAnalyticsRouteSource } from '../modules/utils/getAnalyticsRouteSource'

function DispatchDriverPage() {
    const [errorMessage, setErrorMessage] = useState()
    const [loadingDriverId, setLoadingDriverId] = useState()
    const { createDispatch, getRouteById, drivers } = useDataContext()
    const { routeId } = useParams()
    const route = getRouteById(routeId)
    const history = useHistory()

    const dispatchRoute = async (driverId) => {
        if (loadingDriverId) {
            return
        }

        setLoadingDriverId(driverId)
        try {
            const dispatch = await createDispatch(routeId, driverId)
            track('Route Dispatched', {
                route_id: routeId,
                source: getAnalyticsRouteSource(dispatch.created_via),
                driver_id: driverId,
                number_of_stops: route.stops.length
            })
            history.push(`/dispatches/${dispatch.id}`)
        } catch (err) {
            setErrorMessage(err.message)
        } finally {
            setLoadingDriverId()
        }
    }

    return (
        <Modal expandedOnLoad onClose={() => history.goBack()}>
            <Helmet title="Dispatch Driver | Fleetmap Route Dispatch"></Helmet>
            <div>
                <h1 className="heading-2 pb-4 mb-2">{`Dispatch ${route.title}`}</h1>
                <table className="w-full">
                    <thead className="header-bar border-t h-14 text-left">
                        <tr>
                            <th className="pl-4 w-48">Name</th>
                            <th className="pl-4">Status</th>
                            <th className="w-0">
                                <span className="sr-only">Options</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {drivers &&
                            drivers.map((driver) => (
                                <DriverListItem key={driver.id} driver={driver}>
                                    {loadingDriverId !== driver.id ? (
                                        <button
                                            className="text-blue flex items-center"
                                            onClick={() => dispatchRoute(driver.id)}
                                        >
                                            <div>Dispatch</div>
                                            <div className="ml-1">
                                                <ArrowIcon />
                                            </div>
                                        </button>
                                    ) : (
                                        <p className="text-md font-bold text-blue">Dispatching..</p>
                                    )}
                                </DriverListItem>
                            ))}
                    </tbody>
                </table>
                {!drivers?.length && (
                    <p className="mt-4 mb-5 text-md font-semibold text-red">
                        There are no drivers in your fleet. Add them in drivers tab to be able to dispatch routes.
                    </p>
                )}
                {errorMessage && <p className="mt-2 text-md font-semibold text-red">{errorMessage}</p>}
                <div className="flex items-center justify-center mt-4">
                    <Link className="button-light mx-1" to={`/routes/${routeId}`}>
                        Back
                    </Link>
                </div>
            </div>
        </Modal>
    )
}
export default DispatchDriverPage
