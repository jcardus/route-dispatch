import { MapboxDirections, Route, Stop } from '../../types/Models'
import { OptimizedRouteResponse } from '../apis/mapbox'

export function calculateOptimizationMetrics(
    route: Route,
    optimizedRouteResponse: OptimizedRouteResponse,
    directionsBefore: MapboxDirections,
    directionsAfter: MapboxDirections
) {
    // Ensure we have a route and it has the same number of stops as we
    // provided. Make sure to take start and end into consideration
    if (optimizedRouteResponse.routes.length < 1) {
        throw new Error('Could not complete route optimization: Optimized solution not available')
    }

    // +2 for start and end which will be included in the response array
    if (optimizedRouteResponse.routes[0].stops.length !== route.stops.length + 2) {
        throw new Error('Could not complete route optimization: Some stops could not be optimized')
    }

    // Create a new optimized route by mapping the original stops to their index in the new route.
    const { orderedStops, optimizedOrder } = routeStopsOrderedByOptimizationResponse(route, optimizedRouteResponse)

    // Compare the two arrays. If they're the same then we're already on the fastest route.
    const isSameOrder = orderedStops.find((stop, index) => stop.id !== route.stops[index].id) === undefined

    const timeBefore = directionsBefore.routes[0].duration
    const distanceBefore = directionsBefore.routes[0].distance
    const timeAfter = directionsAfter.routes[0].duration
    const distanceAfter = directionsAfter.routes[0].distance

    const optimizedRoute = { ...route, stops: orderedStops }
    const estimatedTimeSaved = isSameOrder ? 0 : timeBefore - timeAfter
    const estimatedDistanceSaved = isSameOrder ? 0 : distanceBefore - distanceAfter
    const result = {
        route: optimizedRoute,
        timeBefore,
        timeAfter,
        optimizedOrder,
        distanceBefore,
        distanceAfter,
        numberOfStops: orderedStops.length,
        estimatedTimeSaved,
        estimatedDistanceSaved,
        estimatedTimeSavedString: humanReadableEstimatedTimeSavedString(estimatedTimeSaved)
    }
    return result
}

export function routeStopsOrderedByOptimizationResponse(
    originalRoute: Route,
    optimizedRouteResponse: OptimizedRouteResponse
): { orderedStops: Stop[]; optimizedOrder: number[] } {
    // Create a new optimized route by mapping the original stops to their index in the new route.
    const optimizedStops = optimizedRouteResponse.routes[0].stops
    const optimizedOrder: number[] = [] // used for analytics

    const sortedRouteStops: Stop[] = []
    optimizedStops.forEach((stop) => {
        const index = parseInt(stop.location)
        if (!isNaN(index)) {
            sortedRouteStops.push(originalRoute.stops[index])
            optimizedOrder.push(index)
        }
    })

    // Include start and end
    if (originalRoute.start) {
        sortedRouteStops.unshift(originalRoute.start)
    }
    if (originalRoute.end) {
        sortedRouteStops.push(originalRoute.end)
    }

    return { orderedStops: sortedRouteStops, optimizedOrder }
}

const humanReadableEstimatedTimeSavedString = (durationInSeconds: number) => {
    if (durationInSeconds <= 0) {
        return "You're already on the fastest route!"
    }

    // Time readout should be based on the duration in seconds.
    // If time is < one minute, use seconds
    // If time is < one hour, use minutes
    // Otherwise, use minutes and hours
    const oneMinuteInSeconds = 60
    const oneHourInSeconds = 60 * 60
    durationInSeconds = Math.round(durationInSeconds)

    if (durationInSeconds < oneMinuteInSeconds) {
        return `${durationInSeconds} ${durationInSeconds === 1 ? 'second' : 'seconds'}`
    } else if (durationInSeconds < oneHourInSeconds) {
        const minutes = Math.floor(durationInSeconds / oneMinuteInSeconds)
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
    } else {
        const hours = Math.floor(durationInSeconds / oneHourInSeconds)
        const minutes = Math.floor(durationInSeconds / oneMinuteInSeconds) % 60 // Get total minutes and then mod 60 to get only what's leftover
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} and ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
    }
}
