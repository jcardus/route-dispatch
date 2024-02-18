import React from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SpinnerCircular } from 'spinners-react'
import { useAppContext } from './context/AppContextProvider'
import './ExpandablePanel.css'
import DownArrow from './icons/DownArrow'
import ProfileIcon from './icons/ProfileIcon'
import SignOutIcon from './icons/SignOutIcon'

const AccountPanel = () => {
    const [isExpanded, setIsExpanded] = useState(false)
    const { user, signOut } = useAppContext()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const origin = process.env.REACT_APP_MAPBOX_ORIGIN_ACCOUNT!

    const panelClass = isExpanded ? 'block' : 'hidden'
    const panelTriggerClasses = []
    if (isExpanded) {
        panelTriggerClasses.push('panel-background-active')
    }

    // @ts-ignore
    return (
        <div className="relative text-gray-light text-sm">
            <button className={panelTriggerClasses.join(' ')} onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex flex-row fill-blue">
                    {!user && <SpinnerCircular color="blue" secondaryColor="#e0e0e0" size={20} thickness={200} />}
                    {user && (
                        <>
                            <ProfileIcon width={30} height={30} className="text-blue" />
                            <div className="mt-1">
                                <DownArrow className="text-blue" />
                            </div>
                        </>
                    )}
                </div>
            </button>
            <div
                className={`absolute top-full right-0 bg-white border border-gray-lighter rounded z-50 shadow ${panelClass}`}
            >
                <div className="flex flex-col p-4 whitespace-nowrap items-start font-bold text-black panel-content">
                    <a className="mb-3 text-black w-full" href={origin} onClick={() => setIsExpanded(!isExpanded)}>
                        Account
                    </a>
                    <Link className="mb-3 text-black w-full" to="/settings" onClick={() => setIsExpanded(!isExpanded)}>
                        Settings
                    </Link>
                    <div className="w-full ">
                        <hr className="mt-1 mb-3" />
                        <div className="font-light text-gray-dark">{user && user.email}</div>
                        <div className="flex">
                            <button
                                className="mt-2 w-full flex items-start font-bold"
                                onClick={() => {
                                    setIsExpanded(!isExpanded)
                                    signOut()
                                }}
                            >
                                <SignOutIcon height={15} />
                                <div className="ml-1">Sign Out</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

AccountPanel.defaultProps = {
    children: undefined
}

export default AccountPanel
