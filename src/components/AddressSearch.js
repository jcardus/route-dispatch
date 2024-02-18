import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder' // eslint-disable-line import/no-unresolved
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import mapboxgl from 'mapbox-gl'
import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react'
import './AddressSearch.css'
import { useAppContext } from './context/AppContextProvider'

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESSTOKEN

const AddressSearch = forwardRef(({ onResult, placeholder }, ref) => {
    const geocoderContainer = useRef(null)
    const geocoder = useRef(null)
    const { user } = useAppContext()
    const startLocation = user.fleet.start_persistent

    useEffect(() => {
        geocoder.current._inputEl.placeholder = placeholder
    }, [placeholder])

    useLayoutEffect(() => {
        // Set `geocoder.current.on` for 'result' and return a closure
        // which will be called as part of the cleanup process
        // when the next render cycle occurs.
        const applyGeocoderResultHandler = () => {
            let handler = (e) => {
                onResult(e.result)
                ref.current?.clear()
            }
            geocoder.current.on('result', handler)
            return () => {
                geocoder.current.off('result', handler)
            }
        }

        if (geocoder.current) {
            return applyGeocoderResultHandler()
        }

        // Use default terminal location for proximity if exists. Otherwise, use Portland, Oregon
        const portland = { lon: -122.683, lat: 45.515 }
        const location = startLocation ? startLocation.location : portland

        geocoder.current = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl,
            proximity: { latitude: location.lat, longitude: location.lon },
            placeholder
        })
        if (ref) {
            ref.current = geocoder.current
        }

        geocoder.current.addTo(geocoderContainer.current)

        return applyGeocoderResultHandler()
    }, [onResult, placeholder, ref, startLocation])

    return (
        <div className="w-full h-14 px-4">
            <div ref={geocoderContainer}></div>
        </div>
    )
})

export default AddressSearch
