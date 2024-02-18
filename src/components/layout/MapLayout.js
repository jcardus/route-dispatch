import { useState } from 'react'
import ButtonWithSpinner from '../ButtonWithSpinner'
import { useAppContext } from '../context/AppContextProvider'
import { useDataContext } from '../context/DataContextProvider'
import MapContextProvider from '../context/MapContextProvider'
import MapView from '../MapView'
import TakeoverModal from '../TakeoverModal'

function MapLayout({ children }) {
    const { dataInitializationState, updateAll } = useDataContext()
    const { isDebugBuild } = useAppContext()
    const [retrying, setRetrying] = useState(false)

    const handleRetryClicked = async () => {
        setRetrying(true)
        await updateAll()
        setRetrying(false)
    }
    return (
        <MapContextProvider>
            <div className="absolute top-0 bottom-0 right-0 left-96 mt-16">
                <MapView />
            </div>
            {dataInitializationState.state == 'loaded' && (
                <div className="absolute inset-0 mt-16 pointer-events-none z-10">{children}</div>
            )}
            {dataInitializationState.state == 'loading' && (
                <TakeoverModal>
                    <div className="text-lg font-semibold text-blue text-center">Loading Map data...</div>
                </TakeoverModal>
            )}
            {dataInitializationState.state == 'error' && (
                // Absoulute layout with w-96 to fill the gap from left-96 in the mapview above
                <div className="flex flex-col text-center absolute inset-y-0 left-0 w-96 mt-16 p-4 flex items-center justify-center font-semibold">
                    An error occurred while loading your data. Please try again.
                    {isDebugBuild && <div>({dataInitializationState.errorMessage})</div>}
                    <ButtonWithSpinner
                        className="button mx-1 mt-2"
                        loading={retrying}
                        fieldProps={{
                            onClick: handleRetryClicked
                        }}
                    >
                        Retry
                    </ButtonWithSpinner>
                </div>
            )}
        </MapContextProvider>
    )
}

export default MapLayout
