import { useState } from 'react'
import { Helmet } from 'react-helmet'
import { Link, Route } from 'react-router-dom'
import { useDataContext } from '../components/context/DataContextProvider'
import DashboardNavigation from '../components/layout/DashboardNavigation'
import DriverListItem from '../components/DriverListItem'
import DriversIcon from '../components/icons/DriversIcon'
import ListFilters from '../components/ListFilters'
import { DriverStatuses } from '../modules/drivers'
import NewDriverPage from './NewDriverPage'

function DriverListPage() {
    const { drivers, getDriverStatus } = useDataContext()
    const driverStatuses = Object.keys(DriverStatuses).map((key) => DriverStatuses[key])

    const [activeFilterSet, setActiveFilterSet] = useState(new Set())
    const handleFilterChecked = (filterName, isChecked) => {
        const tempSet = new Set(activeFilterSet)
        if (isChecked) {
            tempSet.add(filterName.toLowerCase())
        } else {
            tempSet.delete(filterName.toLowerCase())
        }
        setActiveFilterSet(tempSet)
    }

    return (
        <div className="page-panel--large">
            <Helmet title="Driver List | Mapbox Fleet Dashboard"></Helmet>
            <DashboardNavigation />
            <ListFilters filters={driverStatuses} onFilterChecked={handleFilterChecked} />
            <table className="w-full">
                <thead className="header-bar border-t h-14 text-left">
                    <tr>
                        <th className="pl-4 w-48">Name</th>
                        <th className="pl-4">Status</th>
                        <th className="w-0">
                            <span className="sr-only">Options</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {drivers &&
                        drivers
                            .filter(
                                (driver) =>
                                    activeFilterSet.size === 0 ||
                                    activeFilterSet.has(getDriverStatus(driver).toLowerCase())
                            )
                            .map((driver) => <DriverListItem key={driver.id} driver={driver} />)}
                </tbody>
            </table>
            <div className="my-5 ml-4">
                <Link className="button" to="/drivers/new">
                    <DriversIcon />
                    <div className="ml-1.5">Invite Driver</div>
                </Link>
            </div>
            <Route path="/drivers/new">
                <NewDriverPage />
            </Route>
        </div>
    )
}

export default DriverListPage
