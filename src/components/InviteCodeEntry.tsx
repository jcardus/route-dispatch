import { useState } from 'react'
import { useForm } from 'react-hook-form'
import FormInput from './FormInput'
import MapboxIcon from './icons/MapboxIcon'
import TakeoverModal from './TakeoverModal'

const fields = {
    INVITE_CODE: 'invite_code'
}

const validInviteCodes = ['Fleet2022', 'MapboxFleet', 'FleetBeta', 'Fleet22', 'FleetPreview22']

const InviteCodeEntry = ({ onCodeValidated }: { onCodeValidated: () => void }) => {
    const { register, handleSubmit, formState, control } = useForm({ mode: 'onChange' })
    const { errors, isValid } = formState
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

    const onSubmit = (data: any) => {
        const code = data[fields.INVITE_CODE]
        if (validInviteCodes.includes(code)) {
            onCodeValidated()
        } else {
            setErrorMessage('Invalid invitation code')
        }
    }

    return (
        <TakeoverModal disableBackground wrapContent>
            <div className="flex flex-row whitespace-nowrap mb-6 text-blue">
                <span>
                    <MapboxIcon className="h-6" />
                </span>
                <span className="text-l ml-3 px-4 border-l border-blue whitespace-nowrap">
                    Fleet Dashboard <span className="align-bottom text-sm font-semibold">Beta</span>
                </span>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <FormInput
                    className="w-80"
                    label="Invite Code"
                    inputProps={register(fields.INVITE_CODE, { required: true })}
                    isError={errors[fields.INVITE_CODE]}
                />

                <div className="flex flex-row justify-between">
                    <a
                        className="button-light"
                        target="_blank"
                        rel="noopener"
                        href="https://www.mapbox.com/contact/fleet"
                    >
                        Apply For Access
                    </a>

                    <button className="button" disabled={!isValid}>
                        Submit
                    </button>
                </div>
            </form>
            {errorMessage && <p className="mt-2 text-md font-semibold text-red">{errorMessage}</p>}
        </TakeoverModal>
    )
}

export default InviteCodeEntry
