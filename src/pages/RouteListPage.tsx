import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Link, Route as RouterRoute, useHistory, useLocation } from 'react-router-dom'
import {SpinnerCircular} from 'spinners-react'
import {useAppContext} from '../components/context/AppContextProvider'
import {useDataContext} from '../components/context/DataContextProvider'
import FedexSyncModal from '../components/FedexSyncModal'
import FedexIcon from '../components/icons/FedexIcon'
import ImportIcon from '../components/icons/ImportIcon'
import ImportSmallIcon from '../components/icons/ImportSmallIcon'
import RoutesIcon from '../components/icons/RoutesIcon'
import SearchIcon from '../components/icons/SearchIcon'
import LargeLink from '../components/LargeLink'
import DashboardNavigation from '../components/layout/DashboardNavigation'
import ListFilters from '../components/ListFilters'
import Modal from '../components/Modal'
import RouteListSection from '../components/RouteListSection'
import {linkFedexId} from '../modules/apis/straightaway'
import {RouteStatuses} from '../modules/routes'
import {isToday, isYesterday} from '../modules/utils/dateUtil'
import getErrorMessage from '../modules/utils/getErrorMessage'
import {useQuery} from '../modules/utils/useQueryHook'
import {Route} from '../types/Models'
import CreateRoutePage from './CreateRoutePage'
import ImportRoutePage from './ImportRoutePage'

const routeStatuses = Object.keys(RouteStatuses).map((key) => RouteStatuses[key])

type PresentedModal = 'welcome' | 'fedex' | undefined
export type FedexSyncStates = 'syncing' | 'success' | string | undefined // state, error message, or undefined

function RouteListPage() {
    const {routes, getRouteStatus, updateFedexRoutes} = useDataContext()
    const [activeFilterSet, setActiveFilterSet] = useState(new Set())
    const [presentedModal, setPresentedModal] = useState<PresentedModal>(undefined)
    const [fedexAccountSyncState, setFedexAccountSyncState] = useState<FedexSyncStates>(undefined)
    const [fedexRouteSyncState, setFedexRouteSyncState] = useState<FedexSyncStates>(undefined)
    const {user} = useAppContext()
    const query = useQuery()
    const location = useLocation()
    const history = useHistory()


    const handleFilterChecked = (filterName: string, isChecked: boolean) => {
        const tempSet = new Set(activeFilterSet)
        if (isChecked) {
            tempSet.add(filterName.toLowerCase())
        } else {
            tempSet.delete(filterName.toLowerCase())
        }
        setActiveFilterSet(tempSet)
    }

    const dismissWelcomeModal = () => {
        setPresentedModal(undefined)
        localStorage.setItem('mapbox.fleet.isFirstLaunch', 'true')
    }

    // Returns routes grouped by day (today, yesterday, and other) and sorted by created date.
    const groupAndSortRoutes = (routes: Route[]) => {
        const todayRoutes: Route[] = []
        const yesterdayRoutes: Route[] = []
        const otherRoutes: Route[] = []
        routes
            .filter((route) => activeFilterSet.size === 0 || activeFilterSet.has(getRouteStatus(route).toLowerCase()))
            .sort((lhs, rhs) => {
                return (new Date(rhs.created_at) as any) - (new Date(lhs.created_at) as any)
            })
            .forEach((route) => {
                if (isToday(new Date(route.created_at))) {
                    todayRoutes.push(route)
                } else if (isYesterday(new Date(route.created_at))) {
                    yesterdayRoutes.push(route)
                } else {
                    otherRoutes.push(route)
                }
            })

        return [
            { label: 'Today', routes: todayRoutes },
            { label: 'Yesterday', routes: yesterdayRoutes },
            { label: 'Previous', routes: otherRoutes }
        ].filter((group) => group.routes.length > 0)
    }

    const syncFedexAccount = async (fedexId: string) => {
        try {
            setFedexAccountSyncState('syncing')
            await linkFedexId(fedexId)
            setFedexAccountSyncState('success')
        } catch (error) {
            setFedexAccountSyncState(
                `An error occurred while saving your FedEx login information. Please try linking your account again. ${getErrorMessage(
                    error
                )}`
            )
        }
    }

    useEffect(() => {
        if (localStorage.getItem('mapbox.fleet.isFirstLaunch') !== 'true') {
            setPresentedModal('welcome')
        } else if (query.get('fedex-id')) {
            setPresentedModal('fedex')
        } else {
            setPresentedModal(undefined)
        }

        // Show the intercom bubble when the RouteList mounts and shutdown
        // on unmount.
    }, [user, query])

    // FedEx id sync
    useEffect(() => {
        // Don't bother syncing if the fedexId is missing or the fedexId is the same as what we have stored on the user
        const fedexId = query.get('fedex-id')

        if (!fedexId || fedexId === user?.fedex_id) {
            return
        }

        syncFedexAccount(fedexId)
    }, [query, user?.fedex_id])

    useEffect(() => {
        async function update() {
            try {
                setFedexRouteSyncState('syncing')
                await updateFedexRoutes()
                setFedexRouteSyncState('success')
            } catch (err) {
                setFedexRouteSyncState(`Couldn't sync FedEx Routes`)
            }
        }
        update()
    }, [updateFedexRoutes])

    const groupedRoutes = groupAndSortRoutes(routes)
    return (
        <div className="page-panel--large">
            <Helmet title="Route List | Fleetmap Route Dispatch"></Helmet>
            <DashboardNavigation />
            <div className="px-5 flex flex-row space-around items-center justify-between">
                <ListFilters filters={routeStatuses} onFilterChecked={handleFilterChecked} />
                {fedexRouteSyncState === 'syncing' && (
                    <div className="flex flex-row">
                        Syncing FedEx
                        <SpinnerCircular className="ml-2" color="orange" size={20} thickness={200} />
                    </div>
                )}
            </div>
            <table className="w-full">
                <thead className="header-bar border-t h-14 text-left">
                    <tr>
                        <th className="pl-4 w-48">Name</th>
                        <th className="pl-4">Status</th>
                        <th className="pl-4">Created by</th>
                        <th className="pl-4">Assigned to</th>
                        <th className="pl-4">Stops</th>
                        <th className="w-0">
                            <span className="sr-only">Options</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {groupedRoutes.length > 0 &&
                        groupedRoutes.map((group) => (
                            <RouteListSection key={group.label} label={group.label} routes={group.routes} />
                        ))}

                    <RouterRoute path="/routes/import" exact>
                        {/* Embed page inside <tr> and <td> to silence "react router <div> cannot appear as a child of <tbody>" warning*/}
                        <tr>
                            <td>
                                <ImportRoutePage />
                            </td>
                        </tr>
                    </RouterRoute>
                </tbody>
            </table>
            <div className="my-5 ml-4">
                <Link className="button" to="/routes/new">
                    <RoutesIcon />
                    <div className="ml-1.5">Create Route</div>
                </Link>
                <Link className="button ml-2" to="/routes/import">
                    <ImportSmallIcon />
                    <div className="ml-1.5">Import Route</div>
                </Link>
            </div>
            <RouterRoute path="/routes/new">
                <CreateRoutePage />
            </RouterRoute>
            {presentedModal === 'welcome' && (
                <Modal expandedOnLoad containerClassName="text-center" onClose={dismissWelcomeModal}>
                    <h2 className="heading-2 mb-2">Welcome to Fleetmap Route Dispatch</h2>
                    <p className="text-gray mb-3">You currently don’t have any routes created.</p>
                    <div className="grid grid-cols-3 gap-1">
                        <div className="px-1">
                            <LargeLink
                                href="/routes/new"
                                icon={<SearchIcon />}
                                text="Create route from scratch"
                                onClick={dismissWelcomeModal}
                            />
                        </div>
                        <div className="px-1">
                            <LargeLink
                                href="/routes/import"
                                icon={<ImportIcon />}
                                text="Import route from a file"
                                onClick={dismissWelcomeModal}
                            />
                        </div>
                        <div className="px-1">
                            <LargeLink
                                href="/settings"
                                icon={<FedexIcon className="flex flex-col align-center" />}
                                text="Connect your FedEx account"
                                onClick={dismissWelcomeModal}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col mt-4">
                        <h3 className="heading-3">Got a home base?</h3>
                        <Link to="/routes/default-points">Set default start and end points for your routes</Link>
                    </div>
                </Modal>
            )}
            {presentedModal === 'fedex' && (
                <FedexSyncModal
                    syncState={fedexAccountSyncState}
                    onContinue={() => {
                        setFedexAccountSyncState(undefined)
                        setPresentedModal(undefined)
                        // Replace the url with the fedex id and refresh the page
                        history.replace(location.pathname)
                        history.go(0) // refresh the page
                    }}
                    onSettings={() => history.push('/settings')}
                />
            )}
        </div>
    )
}

export default RouteListPage
