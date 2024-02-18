import { Link } from 'react-router-dom'
import AccountPanel from '../AccountPanel'
import MapboxIcon from '../icons/MapboxIcon'

function MainNavigation() {
    return (
        <header className="relative h-16 z-20 bg-white border-b border-gray-lighter">
            <nav className="w-full h-full grid grid-cols-2 items-center auto-cols-max bg-white text-lg text-blue px-6">
                <div className="h-6">
                    <Link to="/" className="flex block content-center" aria-label="Mapbox Fleet Dashboard">
                        <span>
                            <MapboxIcon className="h-6" />
                        </span>
                        <span className="text-l ml-3 px-4 border-l border-blue whitespace-nowrap">
                            Fleet Dashboard <span className="align-bottom text-sm font-semibold">Beta</span>
                        </span>
                    </Link>
                </div>
                <div className="justify-self-end">
                    <AccountPanel />
                </div>
            </nav>
        </header>
    )
}

export default MainNavigation
