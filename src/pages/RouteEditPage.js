import update from 'immutability-helper'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useHistory, useParams } from 'react-router-dom'
import AddressSearch from '../components/AddressSearch'
import { useDataContext } from '../components/context/DataContextProvider'
import { useMapContext } from '../components/context/MapContextProvider'
import DragList from '../components/DragList'
import StopEdit from '../components/StopEdit'
import { track } from '../modules/apis/segment'
import { getStopFromGeocode } from '../modules/utils/getStopFromGeocode'

function RouteEditPage() {
    const [title, setTitle] = useState()
    const [start, setStart] = useState()
    const [end, setEnd] = useState()
    const [stops, setStops] = useState()
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState()
    const [isInitialized, setIsInitialized] = useState()
    const [isAddingStop, setIsAddingStop] = useState(false)
    const [addressResultTarget, _setAddressResultTarget] = useState()
    const addressResultTargetRef = useRef(addressResultTarget)
    const { routeId } = useParams()
    const history = useHistory()
    const { getRouteById, updateRoute } = useDataContext()
    const { setMapRoute } = useMapContext()
    const stopsRef = useRef()
    const titleRef = useRef()
    const geocoderRef = useRef()
    stopsRef.current = stops

    const setAddressResultTarget = (value) => {
        addressResultTargetRef.current = value
        _setAddressResultTarget(value)
    }

    const onSubmit = () => {
        const submit = async () => {
            if (loading) return
            setLoading(true)
            try {
                const response = await updateRoute({
                    id: routeId,
                    title: titleRef.current.value,
                    start,
                    end,
                    stops
                })
                if (response) {
                    history.push(`/routes/${routeId}`)
                }
            } catch (err) {
                setErrorMessage(err.message)
            } finally {
                setLoading(false)
            }
        }
        setErrorMessage()
        submit()
    }

    const onCancel = () => {
        history.push(`/routes/${routeId}`)
    }

    const addStop = (stop) => {
        setIsAddingStop(true)
        stopsRef.current.push(stop)
        setStops(stopsRef.current)
        setIsAddingStop(false)
        track('Route Stop Added', {
            source: 'Search',
            lat: stop.location.lat,
            lon: stop.location.lon,
            stops: [stop],
            number_of_stops: stopsRef.current.length,
            route_id: routeId,
            stops_added_count: 1
        })
    }

    const moveCard = useCallback(
        (dragIndex, hoverIndex) => {
            const dragCard = stops[dragIndex]
            setStops(
                update(stops, {
                    $splice: [
                        [dragIndex, 1],
                        [hoverIndex, 0, dragCard]
                    ]
                })
            )
        },
        [stops]
    )

    const deleteCard = useCallback(
        (index) => {
            setStops(
                update(stops, {
                    $splice: [[index, 1]]
                })
            )
        },
        [stops]
    )
    const onAddressResult = (result) => {
        const stop = getStopFromGeocode(result)
        if (addressResultTargetRef.current === 'start') {
            setStart(stop)
        } else if (addressResultTargetRef.current === 'end') {
            setEnd(stop)
        } else {
            addStop(stop)
        }
        geocoderRef.current._inputEl.value = ''
        setAddressResultTarget()
    }

    const editStart = () => {
        setAddressResultTarget('start')
        geocoderRef.current._inputEl.focus()
    }

    const deleteStart = () => {
        setStart(null)
        setAddressResultTarget()
        geocoderRef.current._inputEl.focus()
    }

    const editEnd = () => {
        setAddressResultTarget('end')
        geocoderRef.current._inputEl.focus()
    }

    const deleteEnd = () => {
        setEnd(null)
        setAddressResultTarget()
        geocoderRef.current._inputEl.focus()
    }

    useEffect(() => {
        const route = getRouteById(routeId)
        setTitle(route.title)
        setStart(route.start)
        setEnd(route.end)
        setStops(route.stops)
        setIsInitialized(true)
        setMapRoute(route)

        return function cleanup() {
            setMapRoute()
        }
    }, [routeId, getRouteById, setMapRoute])

    const getPlaceholderText = () => {
        if (addressResultTarget === 'start') {
            return 'Add a start point'
        } else if (addressResultTarget === 'end') {
            return 'Add an end point'
        } else {
            return 'Add a stop'
        }
    }

    return (
        <div className="page-panel--small flex flex-col">
            <Helmet title={`Edit Route: ${title} | Fleetmap Route Dispatch`}></Helmet>
            <div className="z-10 w-96">
                <div className="header-bar h-16 flex items-center">
                    {isInitialized && (
                        <>
                            <div className="flex-grow px-4">
                                <input
                                    ref={titleRef}
                                    className="px-4 py-2 min-w-full border border-gray-lighter rounded-sm text-lg font-medium"
                                    defaultValue={title}
                                />
                            </div>
                        </>
                    )}
                </div>
                {errorMessage && <div className="px-4 mt-6 text-md font-semibold text-red">{errorMessage}</div>}
                <div className="relative z-10 w-96 bg-white text-gray flex items-center">
                    <AddressSearch
                        placeholder={getPlaceholderText()}
                        onResult={(result) => onAddressResult(result)}
                        ref={geocoderRef}
                    />
                    {isAddingStop && <div className="absolute z-20 inset-0 bg-white opacity-50"></div>}
                </div>
            </div>
            <div className="top-32 pt-6 pb-12">
                {isInitialized ? (
                    <>
                        <StopEdit
                            stop={start}
                            onEdit={editStart}
                            onDelete={deleteStart}
                            onUseDefault={(stop) => setStart(stop)}
                            isStart
                        />
                        <DragList onDrop={moveCard}>
                            {stops.map((stop, index) => (
                                <StopEdit key={index} stop={stop} index={index} onDelete={deleteCard} />
                            ))}
                        </DragList>
                        <StopEdit
                            stop={end}
                            onEdit={editEnd}
                            onDelete={deleteEnd}
                            onUseDefault={(stop) => setEnd(stop)}
                            isEnd
                        />
                    </>
                ) : (
                    <div className="text-center">Loading Route</div>
                )}
            </div>
            <div className="fixed bottom-0 py-2 px-4 bg-white border-t border-gray-lighter w-96 flex items-center">
                <button className="button-red mx-1 w-full" disabled={loading} onClick={onCancel}>
                    <div className="flex-grow">Cancel</div>
                </button>
                <button className="button mx-1 w-full" disabled={loading} onClick={onSubmit}>
                    <div className="flex-grow">Save</div>
                </button>
            </div>
        </div>
    )
}
export default RouteEditPage
