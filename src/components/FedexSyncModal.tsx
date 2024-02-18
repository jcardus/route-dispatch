import { ReactElement, ReactNode } from 'react'
import { SpinnerCircular } from 'spinners-react'
import { FEDEX_SYNC_HELP } from '../modules/constants'
import { FedexSyncStates } from '../pages/RouteListPage'
import Modal from './Modal'

const FedexSyncModal = ({
    syncState,
    onContinue,
    onSettings
}: {
    syncState: FedexSyncStates
    onContinue: () => void
    onSettings: () => void
}): ReactElement | null => {
    if (syncState === undefined) {
        return null
    }

    const buttonText = 'FedEx Sync Complete'
    let body: ReactNode
    switch (syncState) {
        case 'syncing':
            body = (
                <div className="flex flex-col items-center">
                    <h2 className="heading-2 mb-2">Finishing syncing your FedEx account</h2>
                    <SpinnerCircular />
                </div>
            )
            break
        case 'success':
            body = (
                <div className="flex flex-col video-modal">
                    <h2 className="heading-2 mb-2">Almost there... Set up FedEx Sync</h2>
                    <div className="mb-2">
                        All that's left is granting Mapbox Fleet access to your FedEx route data. Follow the
                        instructions below and click "{buttonText}" once you're done.
                    </div>
                    <div className="relative h-full">
                        <iframe
                            src="https://www.loom.com/embed/0ae0495e7fa94f80a49fce90d4f5e478"
                            frameBorder="0"
                            allowFullScreen
                            className="absolute t-0 l-0 w-full h-full"
                            // style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                        ></iframe>
                    </div>
                    <div className="flex justify-center mt-3">
                        <a
                            className="button-light mr-3"
                            href={FEDEX_SYNC_HELP}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Learn More
                        </a>

                        <button className="button" onClick={onContinue}>
                            {buttonText}
                        </button>
                    </div>
                </div>
            )
            break

        default:
            body = (
                <>
                    <h2 className="heading-2 mb-2">Couldn&apos;t sync FedEx account</h2>
                    <div>{syncState}</div>
                    <button className="button" onClick={onSettings}>
                        Settings
                    </button>
                </>
            )
            break
    }

    return (
        <Modal expandedOnLoad containerClassName="text-center" allowsDismissViaBackground={false}>
            {body}
        </Modal>
    )
}

export default FedexSyncModal
