import { CountryCode } from 'libphonenumber-js/types'
import { Controller } from 'react-hook-form'
import './../phoneInputStyle.css'

interface PhoneInputProps {
    label: string
    defaultCountry?: CountryCode
    control: any
    fieldName: string
    className: string
    isError?: any
    errorMessage: string
}

const PhoneInput = ({
    label,
    defaultCountry,
    control,
    fieldName,
    className,
    isError,
    errorMessage
}: PhoneInputProps) => {
    return (
        <div className="mb-4">
            <Controller
                name={fieldName}
                control={control}
                render={({ field: { onChange, value } }) => {
                    return (
                        <div className="mb-4">
                            <label className="block text-gray font-medium mb-1">{label}</label>
                            {isError && <span className="text-xs text-red">{errorMessage}</span>}
                        </div>
                    )
                }}
            />
        </div>
    )
}

PhoneInput.defaultProps = {
    errorMessage: 'Phone number is invalid',
    className: '',
    defaultCountry: 'US'
}

export default PhoneInput
