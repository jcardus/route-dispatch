import { Link, useLocation } from 'react-router-dom'
import DriversIcon from '../icons/DriversIcon'
import RoutesIcon from '../icons/RoutesIcon'

const tabs = [
    {
        url: '/routes',
        label: 'Routes',
        icon: <RoutesIcon />
    },
    {
        url: '/drivers',
        label: 'Drivers',
        icon: <DriversIcon />
    }
]

const DashboardNavigation = () => {
    const { pathname } = useLocation()

    return (
        <div className="header-bar h-16">
            <ul className="flex h-full">
                {tabs.map((tab) => {
                    const linkClass = pathname.startsWith(tab.url) ? 'border-blue' : 'border-transparent text-gray'
                    return (
                        <li key={tab.url}>
                            <Link className={`flex h-full border-b-4 px-5 ${linkClass}`} to={tab.url}>
                                <div className="mr-3 self-center">{tab.icon}</div>
                                <div className="self-center">{tab.label}</div>
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

export default DashboardNavigation
