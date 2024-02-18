import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useHistory } from 'react-router'
import AddressSearch from '../components/AddressSearch'
import { useAppContext } from '../components/context/AppContextProvider'
import RoundTripIcon from '../components/icons/RoundTripIcon'
import StopEdit from '../components/StopEdit'
import { getStopFromGeocode } from '../modules/utils/getStopFromGeocode'

function SetDefaultPointsPage() {
    const FocusField = {
        START: 'Start',
        END: 'End'
    }

    const [start, setStart] = useState()
    const [end, setEnd] = useState()
    const [focusField, setFocusField] = useState(FocusField.START)
    const [loading, setLoading] = useState()
    const [errorMessage, setErrorMessage] = useState()

    const { user, updateUser } = useAppContext()
    const history = useHistory()
    const geocoderRef = useRef()

    const onSubmit = () => {
        const update = async () => {
            try {
                if (loading) return
                setLoading(true)

                await updateUser({
                    fleet: {
                        start_persistent: start,
                        end_persistent: end
                    }
                })
                history.goBack()
            } catch (err) {
                setErrorMessage(err.message)
            } finally {
                setLoading(false)
            }
        }
        update()
    }

    const setStop = (result) => {
        const stop = getStopFromGeocode(result)
        if (focusField === FocusField.START) {
            setStart(stop)
        } else if (focusField === FocusField.END) {
            setEnd(stop)
        }

        geocoderRef.current.clear()
    }

    const deleteStart = () => {
        setStart(null)
        focusOnField(FocusField.START)
    }

    const deleteEnd = () => {
        setEnd(null)
        focusOnField(FocusField.END)
    }

    // Using a function here instead of `useEffect` since we may want to focus a field
    // even when `focusField` is already set to that value.
    const focusOnField = (field) => {
        setFocusField(field)
        geocoderRef.current._inputEl.focus()
    }

    useEffect(() => {
        const fleet = user.fleet || {}
        setStart(fleet.start_persistent)
        setEnd(fleet.end_persistent)
    }, [user])

    let placeholderText = ''
    if (focusField === FocusField.START && start) {
        placeholderText = 'Edit starting location'
    } else if (focusField === FocusField.END && end) {
        placeholderText = 'Edit ending location'
    } else {
        placeholderText = focusField === FocusField.START ? 'Add starting location' : 'Add ending location'
    }

    return (
        <div className="page-panel--small flex flex-col">
            <Helmet title="Set Default Start and End Points | Fleetmap Route Dispatch"></Helmet>
            <div className="px-5 pt-4">
                <h1 className="heading-2 mb-2">Set persistent start and end points for your routes</h1>
                <p>
                    This is helpful if all drivers start their routes from a single location such as a warehouse or
                    terminal. These can be overridden or set later our a route-by-route basis by editing the route as
                    well.
                </p>
            </div>
            <AddressSearch
                placeholder={placeholderText}
                onResult={(result) => setStop(result)}
                field={focusField}
                ref={geocoderRef}
            />
            {errorMessage && <div className="px-4 mt-6 text-md font-semibold text-red">{errorMessage}</div>}
            <div className="pt-4">
                <StopEdit stop={start} onEdit={() => focusOnField(FocusField.START)} onDelete={deleteStart} isStart />
                <StopEdit stop={end} onEdit={() => focusOnField(FocusField.END)} onDelete={deleteEnd} isEnd />

                {start && !end && (
                    <div className="bg-blue-light rounded mx-4 p-4">
                        <div className="heading-3 mb-2">Is this a round trip?</div>
                        <button className="text-blue flex items-center mb-2" onClick={() => setEnd(start)}>
                            <RoundTripIcon />
                            <div className="underline ml-2">Yes, set this as the end location</div>
                        </button>
                    </div>
                )}

                <div className="fixed bottom-0 py-2 px-4 bg-white border-t border-gray-lighter w-96 flex items-center">
                    <button className="button-red mx-1 w-full" onClick={() => history.goBack()}>
                        <div className="flex-grow">Cancel</div>
                    </button>
                    <button className="button mx-1 w-full" onClick={onSubmit} disabled={loading}>
                        <div className="flex-grow">Save</div>
                    </button>
                </div>
            </div>
        </div>
    )
}
export default SetDefaultPointsPage
