import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Link, useHistory, useParams } from 'react-router-dom'
import { SpinnerCircular } from 'spinners-react'
import { useDataContext } from '../components/context/DataContextProvider'
import { useMapContext } from '../components/context/MapContextProvider'
import ExpandablePanel from '../components/ExpandablePanel'
import BackArrow from '../components/icons/BackArrow'
import DeleteIcon from '../components/icons/DeleteIcon'
import DriversIcon from '../components/icons/DriversIcon'
import PinIcon from '../components/icons/PinIcon'
import StopDetail from '../components/StopDetail'
import getErrorMessage from '../modules/utils/getErrorMessage'
import { Dispatch as DispatchModel } from '../types/Models'

interface Data {
    title: string
    dispatch: DispatchModel
}

enum LoadingState {
    Initial,
    Deleting,
    None
}

function DispatchDetailPage() {
    const [data, setData] = useState<Data | undefined>(undefined)
    const [loadingState, setLoadingState] = useState(LoadingState.Initial)
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
    const { dispatchId } = useParams<{ dispatchId: string }>()
    const history = useHistory()
    const { getDriverById, deleteDispatch, fetchDispatch } = useDataContext()
    const { setMapRoute } = useMapContext()

    useEffect(() => {
        const fetchData = async (dispatchId: string) => {
            try {
                const dispatch = await fetchDispatch(dispatchId)
                setData({ dispatch, title: dispatch.title || 'Dispatch' })
                setMapRoute(dispatch)
            } catch (error) {
                setErrorMessage('Could not load progress. Please reload the page.')
            } finally {
                setLoadingState(LoadingState.None)
            }
        }

        fetchData(dispatchId)

        return () => {
            setMapRoute(undefined)
        }
    }, [dispatchId, fetchDispatch, setMapRoute])

    const handleDeleteDispatch = async (dispatchId: string) => {
        setErrorMessage(undefined)

        setLoadingState(LoadingState.Deleting)
        try {
            await deleteDispatch(dispatchId)
            history.push('/routes')
        } catch (err) {
            setErrorMessage(getErrorMessage(err))
        } finally {
            setLoadingState(LoadingState.None)
        }
    }

    const driver = data && data.dispatch.driven_by && getDriverById(data.dispatch.driven_by)

    return (
        <div className="page-panel--small flex flex-col">
            <Helmet title={`${data?.title || 'Route Detail'} | Mapbox Fleet Dashboard`}></Helmet>
            <div className="fixed z-10 w-96">
                <div className="header-bar h-16 flex items-center">
                    <div className="px-4 h-6 border-r border-gray-light">
                        <Link to="/routes">
                            <BackArrow />
                        </Link>
                    </div>
                    <>
                        <div className="flex-grow">
                            {data && <h1 className="px-4 text-lg font-semibold">{data.title}</h1>}
                        </div>

                        <div className="mr-4">
                            {!data || loadingState !== LoadingState.None ? (
                                <SpinnerCircular color="blue" secondaryColor="#e0e0e0" size={20} thickness={200} />
                            ) : (
                                <ExpandablePanel
                                    panelItems={[
                                        {
                                            icon: <DeleteIcon />,
                                            title: 'Delete dispatch',
                                            onClick: () => handleDeleteDispatch(data.dispatch.id),
                                            color: 'red'
                                        }
                                    ]}
                                />
                            )}
                        </div>
                    </>
                </div>

                {data && (
                    <div className="z-10 h-10 border-b border-gray-lighter bg-white text-gray flex items-center px-6 justify-between">
                        <div className="flex items-center">
                            <div className="mr-2">
                                <PinIcon />
                            </div>
                            <div>{`${data.dispatch.stops.filter((s) => s.completed_at).length} / ${
                                data.dispatch.stops.length
                            } stops`}</div>
                        </div>
                        {driver && (
                            <div className="flex items-center ml-4 text-blue">
                                <div className="mr-2">
                                    <DriversIcon />
                                </div>
                                <div>{`${driver.given_name} ${driver.family_name}`}</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="relative top-28">
                {errorMessage && <p className="px-8 pb-4 ptr-3 text-md font-semibold text-red">{errorMessage}</p>}
                {data && (
                    <>
                        <StopDetail stop={data.dispatch.start} isStart />
                        <ul>
                            {data.dispatch.stops.map((stop, index) => (
                                <li key={stop.id}>
                                    <StopDetail stop={stop} number={index + 1} />
                                </li>
                            ))}
                        </ul>
                        <StopDetail stop={data.dispatch.end} isEnd />
                    </>
                )}
            </div>
        </div>
    )
}
export default DispatchDetailPage
