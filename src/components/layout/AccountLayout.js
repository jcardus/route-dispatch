import { Link } from 'react-router-dom'
import BackArrow from '../icons/BackArrow'

function AccountLayout({ children }) {
    return (
        <>
            <div className="header-bar h-16 flex items-center">
                <div className="px-4 h-6 border-r border-gray-light">
                    <Link to="/">
                        <BackArrow />
                    </Link>
                </div>
                <div className="flex-grow">
                    <h1 className="px-4 heading-3">Settings</h1>
                </div>
            </div>
            <div className="max-w-screen-lg mx-auto my-10 flex">
                <div className="max-w-screen-md px-8">{children}</div>
            </div>
        </>
    )
}
export default AccountLayout
