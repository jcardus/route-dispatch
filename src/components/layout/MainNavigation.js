import { Link } from 'react-router-dom'
import AccountPanel from '../AccountPanel'
import Logo from '../icons/MapboxIcon'
const version = 'v1.1'
function MainNavigation() {
    return (
        <header className="relative h-16 z-20 bg-white border-b border-gray-lighter">
            <nav className="w-full h-full grid grid-cols-2 items-center auto-cols-max bg-white text-lg text-blue px-6">
                <div className="h-6">
                    <Link to="/" className="flex block content-center" aria-label="Fleetmap Route Dispatch">
                        <span>
                            <Logo className="h-6" />
                        </span>
                        <span className="text-l ml-3 px-4 border-l border-blue whitespace-nowrap">
                            Route Dispatch <span className="align-bottom text-sm font-semibold">{version}</span>
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
