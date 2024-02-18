import { Dispatch, Route } from '../../types/Models'
import { getCachedLoginValues } from './auth'

export const baseUri = process.env.REACT_APP_API_BASEURI

async function straightawayRequest(uri: string, method = 'GET', body?: any) {
    // Only get session token if we are not using Cypress
    let idToken = ''
    if (!(window as any).Cypress?.loggedIn) {
        const session = getCachedLoginValues().session
        idToken = session?.authorizations[0].token ?? process.env.REACT_APP_ID_TOKEN
        if (idToken.length === 0) {
            throw new Error('Session token unavailable')
        }
    }

    const headers = {
        Authorization: `Bearer mapbox_${idToken}`,
        'User-Agent': 'FleetDashboard',
        'Content-Type': 'application/json'
    }

    const response = await fetch(uri, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    })

    const responseJson = await response.json()

    if (!response.ok) {
        throw new Error(responseJson.message || response.statusText)
    }

    return responseJson
}

export async function createRoute(newRoute: Route) {
    return await straightawayRequest(`${baseUri}/routes/v1`, 'POST', newRoute)
}

export async function importRoute(b64string: string) {
    return await straightawayRequest(`${baseUri}/routes/v1/import`, 'PUT', { b64string })
}

export async function updateRoute(routeId: string, updatedRoute: Partial<Route>) {
    return await straightawayRequest(`${baseUri}/routes/v1/${routeId}`, 'PUT', updatedRoute)
}

export async function fetchRoute(routeId: string) {
    return await straightawayRequest(`${baseUri}/routes/v1/${routeId}`)
}

export async function deleteRoute(routeId: string) {
    return await straightawayRequest(`${baseUri}/routes/v1/${routeId}`, 'DELETE')
}

export async function deleteStop(routeId: string, stopId: string) {
    return await straightawayRequest(`${baseUri}/routes/v1/${routeId}/stops/${stopId}`, 'DELETE')
}

export async function fetchRoutes() {
    return await straightawayRequest(`${baseUri}/routes/v1`)
}

export async function fetchDispatches() {
    return await straightawayRequest(`${baseUri}/dispatches/v1`)
}

export async function fetchDrivers() {
    return await straightawayRequest(`${baseUri}/drivers/v1`)
}

export async function inviteDriver(newDriver: { phone_number: string; given_name: string; family_name: string }) {
    return await straightawayRequest(`${baseUri}/drivers/v1`, 'POST', newDriver)
}

export async function deleteDriver(driverId: string) {
    return await straightawayRequest(`${baseUri}/drivers/v1/${driverId}`, 'DELETE')
}

export async function fetchUser() {
    return await straightawayRequest(`${baseUri}/account/v1`)
}

export async function updateUser(updatedUser: any) {
    return await straightawayRequest(`${baseUri}/account/v1/`, 'PUT', updatedUser)
}

export async function dispatchRoute(routeId: string) {
    return await straightawayRequest(`${baseUri}/routes/v1/${routeId}/dispatch`, 'PUT')
}

export async function fetchDispatch(dispatchId: string) {
    return await straightawayRequest(`${baseUri}/dispatches/v1/${dispatchId}`)
}

export async function updateDispatch(dispatchId: string, updatedDispatch: Dispatch) {
    return await straightawayRequest(`${baseUri}/dispatches/v1/${dispatchId}`, 'PUT', updatedDispatch)
}

export async function deleteDispatch(dispatchId: string) {
    return await straightawayRequest(`${baseUri}/dispatches/v1/${dispatchId}`, 'DELETE')
}

export async function linkFedexId(fedexId: string) {
    return await straightawayRequest(`${baseUri}/account/v1/fedex`, 'PUT', { fedex_id: fedexId })
}

export async function fetchFedexRoutes() {
    return await straightawayRequest(`${baseUri}/routes/v1/fedex/sync`)
}

export async function revokeFedexAccess() {
    return await straightawayRequest(`${baseUri}/account/v1/fedex/revoke`, 'PUT')
}
