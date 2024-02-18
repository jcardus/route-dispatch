import bbox from '@turf/bbox'
import mapboxgl, { GeoJSONSource, Map } from 'mapbox-gl'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { getDirections } from '../modules/routes'
import { getCoordinateFromStop } from '../modules/utils/getCoordinateFromStop'
import getErrorMessage from '../modules/utils/getErrorMessage'
import { route2geojson } from '../modules/utils/route2geojson'
import { Coordinate, User } from '../types/Models'
import { useAppContext } from './context/AppContextProvider'
import { useMapContext } from './context/MapContextProvider'

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESSTOKEN || ''

async function requestDirections(coords: Coordinate[]) {
    if (coords.length) {
        return await getDirections(coords)
    }
}

function clearMap(map: Map) {
    const stopsSource = map.getSource('stops-data') as GeoJSONSource
    stopsSource.setData({
        type: 'FeatureCollection',
        features: []
    })

    const routeSource = map.getSource('route-data') as GeoJSONSource
    routeSource.setData({
        type: 'FeatureCollection',
        features: []
    })
}

function MapView() {
    const mapContainerRef = useRef<HTMLDivElement | null>(null)
    const mapRef = useRef<Map | null>(null)
    const { mapRoute } = useMapContext()
    const { user } = useAppContext()
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

    useEffect(() => {
        setErrorMessage(undefined)
    }, [mapRoute])

    useLayoutEffect(() => {
        if (!mapContainerRef.current) {
            return
        }

        mapRef.current = createMapboxMap(user, mapContainerRef.current)

        return function cleanup() {
            mapRef.current?.remove()
        }
    }, [user])

    /**
     * Creates a new instace of `mapboxgl.Map` centered around the user's default starting point (if applicable) and
     * attaches it to the `mapContainer` element.
     */
    function createMapboxMap(user: User | undefined, mapContainer: HTMLDivElement): Map {
        const startIsSet = user?.fleet && user.fleet.start_persistent
        const center: [number, number] = startIsSet
            ? [user.fleet.start_persistent.location.lon, user.fleet.start_persistent.location.lat]
            : [-122.683, 45.515]
        const zoom = startIsSet ? 11 : 3

        const map = new mapboxgl.Map({
            container: mapContainer,
            style: 'mapbox://styles/straightaway/cl0jpk816000015pkumdnyw87',
            center,
            zoom
        })

        map.on('load', () => {
            map.addSource('stops-data', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                }
            })

            map.addSource('route-data', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                }
            })

            map.addLayer(
                {
                    id: 'route',
                    type: 'line',
                    source: 'route-data',
                    layout: {},
                    paint: {
                        'line-color': '#728BF8',
                        'line-width': 6
                    }
                },
                'road-label'
            )

            map.addLayer(
                {
                    id: 'route-arrows',
                    source: 'route-data',
                    type: 'symbol',
                    layout: {
                        'symbol-placement': 'line',
                        'text-field': '→',
                        'text-rotate': 0,
                        'text-keep-upright': false,
                        'symbol-spacing': 50,
                        'text-size': 22,
                        'text-offset': [0, -0.1]
                    },
                    paint: {
                        'text-color': 'white',
                        'text-halo-color': 'white',
                        'text-halo-width': 0.2
                    }
                },
                'road-label'
            )

            // Consider a separate layer for the depot to skip some of the start/end expressions
            map.addLayer({
                id: 'stops',
                type: 'symbol',
                source: 'stops-data',
                layout: {
                    'text-field': ['case', ['>', ['get', 'idx'], 0], ['get', 'idx'], ''],
                    'text-allow-overlap': true,
                    'text-size': 12,
                    'text-font': ['DIN Pro Medium', 'Open Sans SemiBold', 'Arial Unicode MS Regular'],
                    'icon-image': [
                        'case',
                        ['==', ['get', 'idx'], -1],
                        'flag-green-icon',
                        ['<=', ['get', 'idx'], 0],
                        'flag-black-icon',
                        ['==', ['get', 'complete'], true],
                        'marker-green-40h',
                        ['==', ['get', 'missed'], true],
                        'marker-red-40h',
                        'marker-black-40h'
                    ],
                    'icon-allow-overlap': true
                },
                paint: {
                    'icon-translate': [0, -20],
                    'text-translate': [0, -24]
                }
            })
        })

        return map
    }

    useEffect(() => {
        if (!mapRef.current || !mapRef.current.isStyleLoaded()) return // wait for map to initialize

        clearMap(mapRef.current)

        if (!mapRoute) {
            return
        }

        try {
            // loop through the mapRoute and pull the coordinates for the directions request
            const coords: Coordinate[] = []
            if (mapRoute.start) {
                coords.push(getCoordinateFromStop(mapRoute.start))
            }
            mapRoute.stops.forEach((stop) => {
                coords.push(getCoordinateFromStop(stop))
            })
            if (mapRoute.end) {
                coords.push(getCoordinateFromStop(mapRoute.end))
            }

            if (coords.length > 0) {
                // Casting to any to avoid needing to convert more to Typescript
                const geojson = route2geojson(mapRoute)
                const boundingBox = bbox(geojson) as any

                const stopsSource = mapRef.current.getSource('stops-data') as GeoJSONSource
                stopsSource.setData(geojson)

                if (!boundingBox.includes(Infinity)) {
                    mapRef.current.fitBounds(boundingBox, { padding: 150 })
                }

                requestDirections(coords)
                    .then((d: any) => {
                        const routeSource = mapRef.current?.getSource('route-data') as GeoJSONSource
                        routeSource.setData({
                            type: 'FeatureCollection',
                            features: d ? [d.routes[0]] : []
                        })
                    })
                    .catch((error) => {
                        setErrorMessage(`Could not load route directions: ${getErrorMessage(error)}`)
                    })
            }
        } catch (error) {
            setErrorMessage(`There was a problem drawing route stops: ${getErrorMessage(error)}`)
        }
    }, [mapRoute, mapRef, mapContainerRef])

    return (
        <div ref={mapContainerRef} className="w-full h-full">
            {errorMessage && (
                <div className="w-full h-full flex justify-center">
                    <div className="fixed rounded-sm m-2 text-md font-semibold text-red z-100 bg-white p-3 drop-shadow-lg">
                        {errorMessage}
                    </div>
                </div>
            )}
        </div>
    )
}

export default MapView
