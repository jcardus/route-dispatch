import { Dispatch, Route, Stop, StopStatus } from '../../types/Models'

export function route2geojson(route: Route | Dispatch): any {
    const geojson: { type: string; features: any[] } = {
        type: 'FeatureCollection',
        features: []
    }

    if (route.start) {
        geojson.features.push(buildFeature(route.start, -1))
    }

    if (route.end) {
        geojson.features.push(buildFeature(route.end, -2))
    }

    let idx = 1
    route.stops.forEach((stop) => {
        geojson.features.push(buildFeature(stop, idx))
        idx += 1
    })

    return geojson
}

function buildFeature(stop: Stop, idx: number): any {
    const location =
        stop.routable_locations && stop.routable_locations.length > 0 ? stop.routable_locations[0] : stop.location

    const feature: any = {
        type: 'Feature',
        properties: stop.address_parsed || {},
        geometry: {
            type: 'Point',
            coordinates: [location.lon, location.lat]
        }
    }
    feature.properties.idx = idx

    switch (stop.status) {
        case StopStatus.COMPLETED:
            feature.properties.complete = true
            break
        case StopStatus.MISSED:
            feature.properties.missed = true
            break
        default:
            break
    }

    return feature
}
