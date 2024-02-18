import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Link, Route, useHistory, useParams } from 'react-router-dom'
import { SpinnerCircular } from 'spinners-react'
import { useDataContext } from '../components/context/DataContextProvider'
import { useMapContext } from '../components/context/MapContextProvider'
import ExpandablePanel from '../components/ExpandablePanel'
import BackArrow from '../components/icons/BackArrow'
import DeleteIcon from '../components/icons/DeleteIcon'
import DriversIcon from '../components/icons/DriversIcon'
import EditIcon from '../components/icons/EditIcon'
import OptimizeIcon from '../components/icons/OptimizeIcon'
import PinIcon from '../components/icons/PinIcon'
import OptimizationModal from '../components/OptimizationModal'
import StopDetail from '../components/StopDetail'
import { TimeWindowStrictness } from '../modules/apis/mapbox'
import getErrorMessage from '../modules/utils/getErrorMessage'
import { Route as RouteModel } from '../types/Models'
import { Segment, track } from '../types/Segment'
import DispatchDriverPage from './DispatchDriverPage'

export const OptimizationStatus = {
    None: 'None',
    Loading: 'Loading',
    Loaded: 'Loaded',
    Saving: 'Saving'
}

export type ValueType<T> = T extends Promise<infer U> ? U : T

enum LoadingState {
    Initial,
    Deleting,
    None
}

function RouteDetailPage() {
    const [route, setRoute] = useState<RouteModel | undefined>(undefined)
    const [loadingState, setLoadingState] = useState(LoadingState.Initial)
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

    const [optimizationState, setOptimizationState] = useState<{
        status: string
        result: ValueType<ReturnType<typeof optimizeRoute>> | null
    }>({
        status: OptimizationStatus.None,
        result: null
    })
    const optimizationCancelled = useRef(false)
    const { routeId } = useParams<{ routeId: string }>()
    const history = useHistory()
    const { fetchRouteById, optimizeRoute, deleteRoute, getDriverById, updateRoute } = useDataContext()
    const { setMapRoute } = useMapContext()

    const handleEdit = (routeId: string) => {
        history.push(`/routes/${routeId}/edit`)
    }

    const handleDeleteRoute = async (routeId: string) => {
        setErrorMessage(undefined)
        setLoadingState(LoadingState.Deleting)

        try {
            await deleteRoute(routeId)
            history.push('/routes')
        } catch (err) {
            setErrorMessage(getErrorMessage(err))
        } finally {
            setLoadingState(LoadingState.None)
        }
    }

    const handleDispatch = (routeId: string) => {
        history.push(`/routes/${routeId}/dispatch`)
    }

    const handleOptimize = async (route: RouteModel, strictness: TimeWindowStrictness) => {
        try {
            optimizationCancelled.current = false
            setErrorMessage(undefined)
            setOptimizationState({ ...optimizationState, status: OptimizationStatus.Loading })

            track<Segment.Optimization.ProblemSubmittedType>('Route Optimize Start', {
                route_id: route.id,
                route_version: route.version
            })

            const result = await optimizeRoute(
                route,
                strictness,
                () => {
                    return optimizationCancelled.current
                },
                (attemptCount: number) => {
                    track<Segment.Optimization.SolutionPollType>('Route Optimize Poll', {
                        route_id: route.id,
                        route_version: route.version,
                        attemptCount
                    })
                }
            )

            track<Segment.Optimization.Success>('Route Optimize Optimized', {
                route_id: route.id,
                route_version: route.version,
                optimization_problem_id: result.optimizationProblemId,
                computing_time: result.computingTime,
                time_before: result.timeBefore,
                time_after: result.timeAfter,
                optimized_order: result.optimizedOrder,
                distance_before: result.distanceBefore,
                distance_after: result.distanceAfter,
                number_of_stops: result.numberOfStops,
                estimated_time_saved: result.estimatedTimeSaved,
                estimated_distance_saved: result.estimatedDistanceSaved
            })

            setOptimizationState({
                status: OptimizationStatus.Loaded,
                result: result
            })
        } catch (error) {
            // Only show an error if we didn't cancel optimziation
            if (!optimizationCancelled.current) {
                track<Segment.Optimization.Error>('Error Error Optimizing', {
                    route_id: route.id,
                    route_version: route.version,
                    number_of_stops: route.stops.length,
                    reason: getErrorMessage(error)
                })

                if (error instanceof Error) {
                    setErrorMessage(getErrorMessage(error))
                } else {
                    setErrorMessage('Unable to optimize your route. Check your delivery windows and try again.')
                }
            } else {
                track<Segment.Optimization.Cancelled>('Route Optimize Cancelled', {
                    route_id: route.id,
                    route_version: route.version
                })
            }

            setOptimizationState({
                status: OptimizationStatus.None,
                result: null
            })
        }
    }

    /**
     * Refer {@link DataContextProvider.optimizeRoute}
     *
     * @param optimizationResult Result returned from Optimization API
     */
    const saveOptimizationResult = async (optimizationResult: any) => {
        try {
            setOptimizationState({
                status: OptimizationStatus.Saving,
                result: optimizationState.result
            })

            const route = optimizationResult.route
            // Remove start and end stops from optimized list.
            // No checks on length, optimizeRoute ensures min length of 3
            route.stops = route.stops.slice(1, -1)
            await updateRoute(route)
            setRoute(route)
        } catch (error) {
            setErrorMessage(getErrorMessage(error))
        } finally {
            setOptimizationState({
                status: OptimizationStatus.None,
                result: null
            })
        }
    }

    useEffect(() => {
        const fetchData = async (routeId: string) => {
            try {
                const route = await fetchRouteById(routeId)
                setRoute(route)
                setMapRoute(route)
            } catch (error) {
                setErrorMessage('Could not load route. Please reload the page.')
            } finally {
                setLoadingState(LoadingState.None)
            }
        }

        fetchData(routeId)

        return () => {
            setMapRoute(undefined)
        }
    }, [routeId, fetchRouteById, setMapRoute])

    const driver = route && route.dispatch_to && getDriverById(route.dispatch_to)
    const isLoading = !route || loadingState !== LoadingState.None
    return (
        <div className="page-panel--small flex flex-col">
            <Helmet title={`${route ? route.title : 'Route Detail'} | Mapbox Fleet Dashboard`}></Helmet>
            <div className="fixed z-10 w-96">
                <div className="header-bar h-16 flex items-center">
                    <div className="px-4 h-6 border-r border-gray-light">
                        <Link to="/routes">
                            <BackArrow />
                        </Link>
                    </div>

                    <>
                        <div className="flex-grow">
                            <h1 className="px-4 text-lg font-semibold">{route?.title || 'Loading Route'}</h1>
                        </div>

                        <div className="mr-4">
                            {isLoading ? (
                                <SpinnerCircular color="blue" secondaryColor="#e0e0e0" size={20} thickness={200} />
                            ) : (
                                <ExpandablePanel
                                    panelItems={[
                                        {
                                            icon: <DriversIcon />,
                                            title: 'Dispatch',
                                            disabled: isLoading,
                                            onClick: () => handleDispatch(route.id)
                                        },
                                        {
                                            icon: <OptimizeIcon />,
                                            title: 'Optimize',
                                            disabled: route.stops.length < 3,
                                            onClick: () => handleOptimize(route, 'strict')
                                        },
                                        {
                                            icon: <EditIcon />,
                                            title: 'Edit route',
                                            disabled: isLoading,
                                            onClick: () => handleEdit(route.id)
                                        },
                                        {
                                            icon: <DeleteIcon />,
                                            title: 'Delete route',
                                            disabled: isLoading,
                                            onClick: () => handleDeleteRoute(route.id),
                                            color: 'red'
                                        }
                                    ]}
                                />
                            )}
                        </div>
                    </>
                </div>
                {route && (
                    <div className="z-10 h-10 border-b border-gray-lighter bg-white text-gray flex items-center px-6 justify-between">
                        <div className="flex items-center">
                            <div className="mr-2">
                                <PinIcon />
                            </div>
                            <div>{`${route.stops.length} stops`}</div>
                        </div>
                        {driver && (
                            <div className="flex items-center ml-4 text-blue">
                                <div className="mr-2">
                                    <DriversIcon />
                                </div>
                                <div>{`${driver.given_name} ${driver.family_name}`}</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="relative top-28">
                {errorMessage && <p className="px-8 pb-4 ptr-3 text-md font-semibold text-red">{errorMessage}</p>}
                {route && (
                    <>
                        <StopDetail stop={route.start} isStart />
                        <ul>
                            {route.stops.map((stop, index) => (
                                <li key={stop.id}>
                                    <StopDetail stop={stop} number={index + 1} />
                                </li>
                            ))}
                        </ul>
                        <StopDetail stop={route.end} isEnd />
                    </>
                )}
            </div>
            {optimizationState.status !== OptimizationStatus.None && (
                <OptimizationModal
                    status={optimizationState.status}
                    result={optimizationState.result}
                    onClose={() => {
                        optimizationCancelled.current = true
                        setOptimizationState({ status: OptimizationStatus.None, result: null })
                    }}
                    onSave={() => saveOptimizationResult(optimizationState.result)}
                />
            )}

            <Route path="/routes/:routeId/dispatch">
                <DispatchDriverPage />
            </Route>
        </div>
    )
}
export default RouteDetailPage
