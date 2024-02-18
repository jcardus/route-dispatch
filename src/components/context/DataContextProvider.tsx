import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import * as mapbox from '../../modules/apis/mapbox'
import { revokeFedexAccess } from '../../modules/apis/straightaway'
import * as driversProvider from '../../modules/drivers'
import * as routesProvider from '../../modules/routes'
import {
    calculateOptimizationMetrics,
    routeStopsOrderedByOptimizationResponse
} from '../../modules/utils/calculateOptimizationMetrics'
import { getCoordinateFromStop } from '../../modules/utils/getCoordinateFromStop'
import getErrorMessage from '../../modules/utils/getErrorMessage'
import { Dispatch, DispatchStatus, Driver, Route } from '../../types/Models'

const { RouteStatuses } = routesProvider
const { DriverStatuses } = driversProvider

// Use undefined! to silence TS warning. We'll populate its values when the component is returned
const DataContext = createContext<DataContextProviderProps>(undefined!) // eslint-disable-line @typescript-eslint/no-non-null-assertion

// Unfortunately there isn't a good way (that I know of) to get the types implicitly since they're returned as a prop
// on DataContext. Declaring the type explicity for now.
interface DataContextProviderProps {
    routes: Route[]
    getRouteById: (routeId: string) => Route | undefined
    fetchRouteById: (routeId: string) => Promise<Route>
    drivers: Driver[]
    inviteDriver: (phone_number: string, given_name: string, family_name: string) => Promise<any>
    deleteDriver: (driverId: string) => Promise<any>
    getDriverById: (driverId: string) => Driver | undefined
    createRoute: (newRoute: Route) => Promise<any>
    updateRoute: (updatedRoute: Route) => Promise<any>
    optimizeRoute: (
        route: Route,
        strictness: mapbox.TimeWindowStrictness,
        cancelHandler?: (() => boolean) | undefined,
        pollHandler?: ((attemptCount: number) => void) | undefined
    ) => Promise<{
        optimizationProblemId: string
        computingTime: number
        route: any
        timeBefore: any
        timeAfter: number
        optimizedOrder: any[]
        distanceBefore: any
        distanceAfter: number
        numberOfStops: number
        estimatedTimeSaved: number
        estimatedDistanceSaved: number
        estimatedTimeSavedString: string
    }>
    deleteRoute: (routeId: string) => Promise<void>
    importRoute: (base64String: string) => Promise<Route>
    getRouteStatus: (route: Route) => string
    getDriverStatus: (driver: Driver) => string
    createDispatch: (routeId: string, driverId: string) => Promise<Dispatch>
    fetchDispatch: (dispatchId: string) => Promise<Dispatch>
    deleteDispatch: (dispatchId: string) => Promise<void>
    getDispatchByRouteId: (routeId: string) => Dispatch | undefined
    updateAll: () => Promise<void>
    updateFedexRoutes: () => Promise<void>
    revokeFedexAccess: () => Promise<void>
    dataInitializationState: DataInitializationState
    fedexInitializationState: DataInitializationState
}

interface DataInitializationState {
    state: 'none' | 'loading' | 'loaded' | 'error'
    errorMessage?: string
}

function DataContextProvider({ children, hasUser }: { children: ReactNode; hasUser: boolean }) {
    const [dataInitializationState, setDataInitializationState] = useState<DataInitializationState>({
        state: 'loading',
        errorMessage: undefined
    })

    const [fedexInitializationState] = useState<DataInitializationState>({
        state: 'none',
        errorMessage: undefined
    })

    const [routes, setRoutes] = useState<Route[]>([])
    const [dispatches, setDispatches] = useState<Dispatch[]>([])
    const [drivers, setDrivers] = useState<Driver[]>([])

    /**
     * Updates the current routes with the updated routes. For duplicates, the updated route
     * takes precedence.
     */
    function mergeCurrentRoutesWithRoutes(currentRoutes: Route[], updatedRoutes: Route[]): Route[] {
        // Filter out any routes with a duplicate id, concat the two arrays, and sort by updated date
        const mergedRoutes = currentRoutes
            .filter((current) => updatedRoutes.find((r) => r.id === current.id) === undefined)
            .concat(updatedRoutes)
            .sort((lhs, rhs) => {
                if (lhs.updated_at === rhs.updated_at && lhs.title && rhs.title) {
                    return lhs.title > rhs.title ? -1 : 1
                } else {
                    return lhs.updated_at > rhs.updated_at ? 1 : -1
                }
            })
        return mergedRoutes
    }

    const getRouteById = (routeId: string) => {
        return routes.find((route) => route.id === routeId)
    }

    const fetchRouteById = useCallback(async (routeId: string) => {
        const route = await routesProvider.fetchRoute(routeId)
        setRoutes((prevRoutes) => prevRoutes.map((prev) => (prev.id === route.id ? route : prev)))
        return route
    }, [])

    const getDriverById = (driverId: string) => {
        return drivers.find((driver) => driver.id === driverId)
    }

    const updateRoutes = useCallback(async () => {
        const newRoutes = await routesProvider.getRoutes()
        setRoutes((prevRoutes) => mergeCurrentRoutesWithRoutes(prevRoutes, newRoutes))
    }, [])

    const updateDispatches = useCallback(async () => {
        const newDispatches = await routesProvider.getDispatches()
        setDispatches(newDispatches)
    }, [])

    const updateDrivers = useCallback(async () => {
        const newDrivers = await driversProvider.getDrivers()
        setDrivers(newDrivers)
    }, [])

    const updateFedexRoutes = useCallback(async () => {
        const fedexRoutes = await routesProvider.fetchFedexRoutes()

        setRoutes((prevRoutes) => mergeCurrentRoutesWithRoutes(prevRoutes, fedexRoutes))
    }, [])

    const updateAll = useCallback(async () => {
        try {
            await Promise.all([updateRoutes(), updateDispatches(), updateDrivers()])
            setDataInitializationState({ state: 'loaded', errorMessage: undefined })
        } catch (error) {
            setDataInitializationState({ state: 'error', errorMessage: getErrorMessage(error) })
        }
    }, [updateRoutes, updateDispatches, updateDrivers])

    const inviteDriver = async (phone_number: string, given_name: string, family_name: string) => {
        const response = await driversProvider.inviteDriver(phone_number, given_name, family_name)
        await updateDrivers()
        return response
    }

    const deleteDriver = async (driverId: string) => {
        const response = await driversProvider.deleteDriver(driverId)
        await updateDrivers()
        return response
    }

    const createRoute = async (newRoute: Route) => {
        const route = await routesProvider.createRoute(newRoute)
        setRoutes([...routes, route])
        return route
    }

    const importRoute = async (base64String: string) => {
        const route = await routesProvider.importRoute(base64String)
        setRoutes([...routes, route])
        return route
    }

    const updateRoute = async (updatedRoute: Route) => {
        const response = await routesProvider.updateRoute(updatedRoute)
        setRoutes((prevRoutes) => prevRoutes.map((route) => (route.id === response.id ? response : route)))
        return response
    }

    const optimizeRoute = async (
        route: Route,
        strictness: mapbox.TimeWindowStrictness,
        cancelHandler?: () => boolean,
        pollHandler?: (attemptCount: number) => void
    ) => {
        if (!route.start) {
            throw new Error('Add a starting point to your route from the route list')
        } else if (!route.end) {
            throw new Error('Add an ending point to your route from the route list')
        } else if (route.stops.length === 0) {
            throw new Error('Please add some stops to your route')
        }

        const start = route.start
        const end = route.end
        const waypoints = route.stops
        const computeStartTime = new Date()

        const response = await mapbox.optimizeRoute(start, end, waypoints, strictness, cancelHandler, pollHandler)

        const computingTime = (new Date().getMilliseconds() - computeStartTime.getMilliseconds()) / 1000

        // Fetch directions so we can tell the user how much the optimization improved the route.
        const allRouteStops = [route.start].concat(route.stops, [route.end])
        const directionsBefore = await routesProvider.getDirections(allRouteStops.map(getCoordinateFromStop))
        const directionsAfter = await routesProvider.getDirections(
            routeStopsOrderedByOptimizationResponse(route, response).orderedStops.map(getCoordinateFromStop)
        )

        if (directionsBefore.routes.length < 1 || directionsAfter.routes.length < 1) {
            throw new Error('Could not complete route optimizization: Could not fetch directions.')
        }

        const optimizationResult = calculateOptimizationMetrics(route, response, directionsBefore, directionsAfter)
        return { ...optimizationResult, optimizationProblemId: response.problemId, computingTime }
    }

    const deleteRoute = async (routeId: string) => {
        await routesProvider.deleteRoute(routeId)
        setRoutes(routes.filter((item) => item.id !== routeId))
    }

    const getRouteStatus = (route: Route) => {
        const dispatch = dispatches.find((d) => d.route_id === route.id && d.route_version === route.version)
        if (!dispatch) {
            return RouteStatuses.DRAFT
        }

        const completedStops = dispatch.stops.filter((s) => s.completed_at)
        if (completedStops.length === 0) {
            return RouteStatuses.DISPATCHED
        } else if (completedStops.length === dispatch.stops.length || dispatch.status === DispatchStatus.COMPLETED) {
            return RouteStatuses.COMPLETE
        } else {
            return RouteStatuses.IN_PROGRESS
        }
    }

    const getDriverStatus = (driver: Driver) => {
        const dispatch = dispatches.find((d) => d.driven_by === driver.id)
        if (!dispatch || dispatch.status === DispatchStatus.COMPLETED) {
            return DriverStatuses.AVAILABLE
        } else {
            return DriverStatuses.DISPATCH_ASSIGNED
        }
    }

    const createDispatch = async (routeId: string, driverId: string): Promise<Dispatch> => {
        const dispatch = await routesProvider.createDispatch(routeId, driverId)
        await updateAll()
        return dispatch
    }

    const fetchDispatch = useCallback(async (dispatchId: string) => {
        const dispatch = await routesProvider.fetchDispatch(dispatchId)
        setDispatches((prevDispatches) => prevDispatches.map((prev) => (prev.id === dispatch.id ? dispatch : prev)))
        return dispatch
    }, [])

    const getDispatchByRouteId = (routeId: string) => {
        const route = getRouteById(routeId)
        if (!route) return

        const status = getRouteStatus(route)
        if (status !== RouteStatuses.DRAFT) {
            return dispatches.find((d) => d.route_id === route.id && d.route_version === route.version)
        }
    }

    const deleteDispatch = async (dispatchId: string) => {
        await routesProvider.deleteDispatch(dispatchId)
        setDispatches(dispatches.filter((item) => item.id !== dispatchId))
    }

    const revokeFedex = async () => {
        await revokeFedexAccess()
        await updateAll()
    }

    useEffect(() => {
        async function update() {
            await updateAll()
        }
        if (hasUser) {
            update()
        }
    }, [hasUser, updateAll])

    return (
        <DataContext.Provider
            value={{
                routes,
                getRouteById,
                fetchRouteById,
                drivers,
                inviteDriver,
                deleteDriver,
                getDriverById,
                createRoute,
                updateRoute,
                optimizeRoute,
                deleteRoute,
                importRoute,
                getRouteStatus,
                getDriverStatus,
                createDispatch,
                fetchDispatch,
                getDispatchByRouteId,
                deleteDispatch,
                updateAll,
                updateFedexRoutes,
                revokeFedexAccess,
                dataInitializationState,
                fedexInitializationState
            }}
        >
            {children}
        </DataContext.Provider>
    )
}

export default DataContextProvider

export const useDataContext = (): DataContextProviderProps => {
    return useContext(DataContext)
}
