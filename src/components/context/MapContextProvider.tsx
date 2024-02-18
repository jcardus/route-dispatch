import { createContext, ReactChildren, useContext, useState } from 'react'
import { Dispatch, Route } from '../../types/Models'

export interface MapContextProviderProps {
    mapRoute: Route | Dispatch | undefined
    setMapRoute: (route: Route | Dispatch | undefined) => void
}

const MapContext = createContext<MapContextProviderProps>(undefined!) // eslint-disable-line @typescript-eslint/no-non-null-assertion

function MapContextProvider({ children }: { children: ReactChildren }) {
    const [mapRoute, setMapRoute] = useState<Route | Dispatch | undefined>()

    return (
        <MapContext.Provider
            value={{
                mapRoute,
                setMapRoute
            }}
        >
            <>{children}</>
        </MapContext.Provider>
    )
}

export default MapContextProvider

export const useMapContext = () => {
    return useContext(MapContext)
}
