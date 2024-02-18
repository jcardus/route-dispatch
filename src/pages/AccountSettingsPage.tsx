import { useState } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import ButtonWithSpinner from '../components/ButtonWithSpinner'
import { useAppContext } from '../components/context/AppContextProvider'
import { useDataContext } from '../components/context/DataContextProvider'
import FedexIconFilled from '../components/icons/FedexIconFilled'
import StopDetail from '../components/StopDetail'
import { FEDEX_SYNC_HELP } from '../modules/constants'
import getErrorMessage from '../modules/utils/getErrorMessage'

const fedexOktaUrl = process.env.REACT_APP_FEDEX_OKTA_URL

function AccountSettingsPage() {
    const { user } = useAppContext()
    const { revokeFedexAccess } = useDataContext()
    const fleet = user?.fleet
    const [revokingFedexAccess, setRevokingFedexAccess] = useState(false)
    const [revokeError, setRevokeError] = useState<string | undefined>(undefined)
    const removeFedexAccount = async () => {
        try {
            setRevokingFedexAccess(true)
            await revokeFedexAccess()
            if (user) {
                user.fedex_id = null
            }
        } catch (error) {
            setRevokeError(getErrorMessage(error))
        } finally {
            setRevokingFedexAccess(false)
        }
    }

    return (
        <>
            <Helmet title="Account Settings | Mapbox Fleet Dashboard"></Helmet>
            <h1 className="heading-1 mb-5">Settings</h1>
            <h2 className="heading-2 mb-1 mt-3">Default route start and end points</h2>
            <p>
                This is helpful if all drivers start their routes from a single location such as a warehouse or
                terminal. These can be overridden or set later our a route-by-route basis by editing the route as well.
            </p>
            <div className="mt-3">
                <StopDetail stop={fleet?.start_persistent} isStart />
                <StopDetail stop={fleet?.end_persistent} isEnd />
                <Link to="/routes/default-points">Edit start and end points</Link>
            </div>

            <h2 className="heading-2 mb-1 mt-12">Connected Services</h2>
            <p>Authorize accounts to sync route data</p>
            <div className="mt-8">
                <h3 className="heading-3 mb-2">FedEx</h3>
                {revokeError && <p className="pb-4 text-md font-semibold text-red">{revokeError}</p>}

                <div className="flex">
                    <div className="pr-4">
                        <FedexIconFilled />
                    </div>
                    <div className="flex flex-1 pr-4 flex-col justify-between">
                        <div>
                            {user?.fedex_id
                                ? 'Revoke access to your FedEx account. Doing so will prevent Mapbox Fleet from being able to pull data from your FedEx account.'
                                : 'Sign in with your Purple ID a single time to allow Mapbox Fleet to pull data from your FedEx account.'}
                        </div>
                        <a className="" href={FEDEX_SYNC_HELP} target="_blank" rel="noopener noreferrer">
                            Learn more about FedEx integration ›
                        </a>
                    </div>
                    <div>
                        {user?.fedex_id ? (
                            <ButtonWithSpinner
                                className="button-red"
                                loading={revokingFedexAccess}
                                fieldProps={{ onClick: removeFedexAccount }}
                                color="red"
                            >
                                Revoke
                            </ButtonWithSpinner>
                        ) : (
                            <a className="button" href={fedexOktaUrl}>
                                Connect
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default AccountSettingsPage
