import { SpinnerCircular } from 'spinners-react'
import { OptimizationStatus } from '../pages/RouteDetailPage'
import ButtonWithSpinner from './ButtonWithSpinner'
import OptimizeIcon from './icons/OptimizeIcon'
import OptimizePinIcon from './icons/OptimizePinIcon'
import Modal from './Modal'

const OptimizationModal = ({ status, result, onSave, onClose }) => {
    return (
        <Modal expandedOnLoad allowsDismissViaBackground={false} bgColor="bg-blue">
            {/* For whatever reason tailwind width isn't working on this element :shrug: */}
            <div className="grid place-items-center px-2 py-4 text-white" style={{ minWidth: 320, minHeight: 320 }}>
                {/* Optimization Loading Modal */}
                {status === OptimizationStatus.Loading && (
                    <>
                        <OptimizePinIcon />
                        <h3 className="heading-3 mb-2 mt-3 text-white">Optimizing route...</h3>
                        <p className="text-white mb-2">(this may take a moment)</p>
                        <SpinnerCircular size={30} thickness={200} color="white" />
                        <button className="button-light-inverted mt-10" onClick={onClose}>
                            Cancel
                        </button>
                    </>
                )}

                {/* Optimization Complete Modal and has better route */}
                {result &&
                    ((status === OptimizationStatus.Loaded && result.estimatedTimeSaved > 0) ||
                        status === OptimizationStatus.Saving) && (
                        <>
                            <span className="flex items-center justify-center font-semibold text-lg">
                                <OptimizeIcon props={{ className: 'inline-block mr-1' }} /> Use this route?
                            </span>
                            <p className="text-center mt-4 text-lg">
                                You&apos;ll save
                                <span className="font-semibold">{' ' + result?.estimatedTimeSavedString}</span> of drive time.
                            </p>

                            <div className="flex flex-row mt-2 space-x-4 mt-3 min-w-400">
                                <button
                                    className="button-light-inverted w-1/2"
                                    disabled={status === OptimizationStatus.Saving}
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>

                                <ButtonWithSpinner
                                    className="border-solid border-white button-light w-1/2"
                                    loading={status === OptimizationStatus.Saving}
                                    fieldProps={{
                                        onClick: onSave
                                    }}
                                    color="#4264FB"
                                >
                                    Save
                                </ButtonWithSpinner>
                            </div>
                        </>
                    )}

                {/* Optimization Complete Modal and already best route */}
                {result && status === OptimizationStatus.Loaded && result.estimatedTimeSaved <= 0 && (
                    <>
                        <span className="flex items-center justify-center font-semibold ">
                            <OptimizeIcon props={{ className: 'inline-block mr-1' }} /> You&apos;re all set!
                        </span>
                        <p className="text-center mt-4 text-lg">You&apos;re already on the fastest route.</p>

                        <div className="flex flex-row mt-2 mt-3">
                            <button
                                className="button-light-inverted"
                                disabled={status === OptimizationStatus.Saving}
                                onClick={onClose}
                            >
                                Done
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    )
}

export default OptimizationModal
