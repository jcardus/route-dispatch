interface FormInputProps {
    label: string
    type: string
    inputProps: any
    isError?: any
    errorMessage: string
    defaultValue?: any
    className?: string
    isDisabled: boolean
    children?: any
}

function FormInput({
    label,
    type = 'text',
    inputProps,
    isError,
    errorMessage = 'This field is required',
    defaultValue,
    className,
    isDisabled,
    children
}: FormInputProps) {
    const commonClasses = 'block border rounded-sm text-gray border-gray-lighter'

    return (
        <div className="mb-4">
            {type === 'checkbox' && (
                <label className={`${commonClasses} ${className} flex border-none items-center shadow-none`}>
                    <input
                        className="rounded-sm border-gray-lighter mr-2 focus:shadow-none focus:ring-0"
                        type={type}
                        defaultValue={defaultValue}
                        {...inputProps}
                        disabled={isDisabled}
                    />{' '}
                    {label}
                </label>
            )}

            {type !== 'checkbox' && (
                <>
                    <label className="block text-gray font-medium mb-1">{label}</label>
                    {type === 'select' && (
                        <select
                            className={`${className} ${commonClasses} py-2 pl-2 pr-8 `}
                            defaultValue={defaultValue}
                            {...inputProps}
                            disabled={isDisabled}
                        >
                            {children}
                        </select>
                    )}
                    {type !== 'select' && (
                        <input
                            className={`${className} ${commonClasses} p-2`}
                            type={type}
                            defaultValue={defaultValue}
                            {...inputProps}
                            disabled={isDisabled}
                        />
                    )}
                    {isError && <span className="text-xs text-red">{errorMessage}</span>}
                </>
            )}
        </div>
    )
}

FormInput.defaultProps = {
    type: 'text',
    errorMessage: 'This field is required',
    isDisabled: false
}

export default FormInput
