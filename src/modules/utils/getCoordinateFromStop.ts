import { Coordinate, Stop } from '../../types/Models'

export function getCoordinateFromStop(location: Stop): Coordinate {
    const locFields =
        location.routable_locations && location.routable_locations.length > 0
            ? location.routable_locations[0]
            : location.location
    return { lon: locFields.lon, lat: locFields.lat }
}
