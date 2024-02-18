import { CountryCode } from 'libphonenumber-js/types'
import { Controller } from 'react-hook-form'
import './../phoneInputStyle.css'
import PhoneInputField from 'react-phone-number-input'

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
                            <PhoneInputField
                                className={`${className} block border rounded-sm text-gray border-gray-lighter p-2`}
                                onChange={onChange}
                                value={value}
                                defaultCountry={defaultCountry}
                                international
                                countryCallingCodeEditable={false}
                            />
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
