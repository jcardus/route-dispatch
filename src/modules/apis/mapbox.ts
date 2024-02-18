import { Coordinate, MapboxDirections, Stop } from '../../types/Models'
import { round } from '../utils/round'

const baseUri = process.env.REACT_APP_MAPBOX_API_BASEURI
const mapboxAccessToken = process.env.REACT_APP_MAPBOX_ACCESSTOKEN! // eslint-disable-line @typescript-eslint/no-non-null-assertion

export type TimeWindowStrictness = 'strict' | 'soft'

// Directions

async function directionsRequest(uri: string, coords: string): Promise<MapboxDirections> {
    const params =
        'alternatives=true&continue_straight=true&roundabout_exits=true&enable_refresh=true&geometries=geojson&overview=full&steps=true&language=en-US&voice_instructions=true&voice_units=imperial&banner_instructions=true&annotations=distance,duration,congestion'
    const request = `${uri}/${coords}?${params}&access_token=${mapboxAccessToken}`
    const response = await fetch(request)

    if (!response.ok) {
        const errorJson = await response.json()
        if (errorJson) {
            throw new Error(`${errorJson.message}`)
        } else {
            throw new Error(`${response}`)
        }
        
    }

    return await response.json()
}

export async function getDirections(coords: Coordinate[]): Promise<MapboxDirections> {
    const coordsString = coords.map((c) => `${round(c.lon, 6)},${round(c.lat, 6)}`).join(';')
    return await directionsRequest(`${baseUri}/directions/v5/mapbox/driving-traffic`, coordsString)
}

// Route Optimization

/**
 * Optimization requests are a two-step process:
 * POST to /optimized-trips/v2?access_token=YOUR_MAPBOX_TOKEN to submit a "problem", and save the id in the JSON response
 * GET from /optimized-trips/v2/:id?access_token=YOUR_MAPBOX_TOKEN to check status and receive the result when it is complete.
 *
 * You'll get 202 Accepted while it's processing, and 200 OK when it's done.
 */
async function submitOptimizationProblem(start: Stop, end: Stop, waypoints: Stop[], strictness: TimeWindowStrictness) {
    const request = `${baseUri}/optimized-trips/v2?access_token=${mapboxAccessToken}&cpu_budget=3`
    const response = await fetch(request, {
        method: 'POST',
        body: createOptimizationProblemRequestBody(start, end, waypoints, strictness),
        headers: {
            'CONTENT-TYPE': 'application/json'
        }
    })
    const json = await response.json()
    return json
}

async function getOptimizationResult(problemId: string) {
    const request = `${baseUri}/optimized-trips/v2/${problemId}?access_token=${mapboxAccessToken}`
    const response = await fetch(request)
    return response
}

// Returns the request body necessary for optimization.
function createOptimizationProblemRequestBody(
    start: Stop,
    end: Stop,
    waypoints: Stop[],
    strictness: TimeWindowStrictness
) {
    const services = waypoints.map((stop, index) => {
        const service = {
            name: `${index}`,
            location: `${index}`
        } as any
        if (stop.time_window) {
            service.service_times = [
                {
                    earliest: stop.time_window.from,
                    latest: stop.time_window.to,
                    type: strictness
                }
            ]
        }
        return service
    })

    const locations = [
        {
            name: 'start',
            coordinates: [start.location.lon, start.location.lat]
        },
        ...waypoints.map((coordinate, index) => {
            return {
                name: `${index}`,
                coordinates: [coordinate.location.lon, coordinate.location.lat]
            }
        }),
        {
            name: 'end',
            coordinates: [end.location.lon, end.location.lat]
        }
    ]

    return JSON.stringify({
        version: 1,
        services,
        locations,
        vehicles: [
            {
                name: 'truck1',
                start_location: 'start',
                end_location: 'end',
                routing_profile: 'mapbox/driving'
            }
        ]
    })
}

/**
 * Takes a start, end, and set of waypoints and returns an optimized verison of the route.
 *
 * `pollHandler` can be used for tracking every time the optimization solution endpoint is polled.
 */
export interface OptimizedRouteResponse {
    dropped: {
        services: any[]
        shipments: any[]
    }
    routes: {
        vehicle: string
        stops: {
            location: string
            eta: string
            type: string
            wait: number
            odometer: number
        }[]
    }[]
    problemId: string
}

export interface OptimizationFailureResponse {
    code: string
    message: string
    ref: string
}

export async function optimizeRoute(
    start: Stop,
    end: Stop,
    waypoints: Stop[],
    strictness: TimeWindowStrictness,
    cancelHandler?: () => boolean,
    pollHandler?: (attemptCount: number) => void
): Promise<OptimizedRouteResponse> {
    // Submit the optimization problem
    const problem = await submitOptimizationProblem(start, end, waypoints, strictness)
    if (!problem.id) {
        throw new Error(`Could not complete route optimization: ${problem.message}`)
    }

    // Poll for the result every second and bail after timeElapsed exceeds threshold (per discussion with @danpat we should
    // typically receive a result in < 10s and should poll every second. The API rate limits at 60 requests per minute for
    // a given endpoint so we should be fine)
    const pollStartTime = new Date().getTime() / 1000
    let timeElapsed = 0
    let attemptCount = 0
    while (timeElapsed < 30) {
        attemptCount += 1
        pollHandler?.(attemptCount)

        const response = await getOptimizationResult(problem.id)
        if (response.status === 200) {
            const json = await response.json()
            if (json.code === 'unsolvable') {
                throw json
            }
            return { ...json, problemId: problem.id }
        }
        const currentTime = new Date().getTime() / 1000
        timeElapsed = currentTime - pollStartTime

        // Wait one second before iterating again
        await new Promise((resolve) => setTimeout(resolve, 1000))

        if (cancelHandler && cancelHandler()) {
            throw new Error('Optimization cancelled')
        }
    }

    throw new Error('Could not complete route optimization: Operation Timed Out')
}
