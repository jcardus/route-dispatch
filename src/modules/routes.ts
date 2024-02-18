import { Coordinate, Route, Stop } from '../types/Models'
import * as mapbox from './apis/mapbox'
import * as straightaway from './apis/straightaway'
import { getActiveVersions } from './utils/getActiveVersions'
import { getLatestVersions } from './utils/getLatestVersions'

export const RouteStatuses: { [key: string]: string } = {
    DRAFT: 'Draft',
    DISPATCHED: 'Dispatched',
    IN_PROGRESS: 'In-progress',
    COMPLETE: 'Complete'
}

export async function getRoutes() {
    const routesResponse = await straightaway.fetchRoutes()
    const activeVersions = getActiveVersions(routesResponse.data)
    return activeVersions
}

export async function fetchRoute(routeId: string) {
    const response = await straightaway.fetchRoute(routeId)
    return response.data
}
export async function createRoute(newRoute: Route) {
    const createResponse = await straightaway.createRoute(newRoute)
    return createResponse.data
}

export async function importRoute(base64String: string) {
    const modifiedString = base64String.replace('data:application/vnd.ms-excel;base64,', '')
    const importResponse = await straightaway.importRoute(modifiedString)
    return importResponse.data
}

export async function updateRoute(updatedRoute: Route) {
    const formatStop = (stop: Stop, order?: number) => ({ ...stop, order })

    // Making type `any` since our stops don't have the expected id and routable_location props. This is the
    // only place where this is applicable.
    const formattedRoute: any = {
        title: updatedRoute.title,
        start: updatedRoute.start ? formatStop(updatedRoute.start) : { reset: true },
        end: updatedRoute.end ? formatStop(updatedRoute.end) : { reset: true },
        stops: updatedRoute.stops.map((stop, i) => formatStop(stop, i))
    }

    const updateResponse = await straightaway.updateRoute(updatedRoute.id, formattedRoute)
    return updateResponse.data
}

export async function deleteRoute(routeId: string) {
    const deleteResponse = await straightaway.deleteRoute(routeId)
    return deleteResponse.data
}

export async function getDispatches() {
    const dispatchesResponse = await straightaway.fetchDispatches()
    const latestVersions = getLatestVersions(dispatchesResponse.data.dispatches)
    return latestVersions
}

export async function createDispatch(routeId: string, driverId: string) {
    await straightaway.updateRoute(routeId, {
        dispatch_to: driverId
    })
    const dispatch = await straightaway.dispatchRoute(routeId)
    return dispatch.data
}

export async function fetchDispatch(dispatchId: string) {
    const response = await straightaway.fetchDispatch(dispatchId)
    return response.data
}

export async function deleteDispatch(dispatchId: string) {
    const deleteResponse = await straightaway.deleteDispatch(dispatchId)
    return deleteResponse.data
}

export async function getDirections(coords: Coordinate[]) {
    return await mapbox.getDirections(coords)
}

export async function fetchFedexRoutes(): Promise<Route[]> {
    const response = await straightaway.fetchFedexRoutes()
    return response.data
}
