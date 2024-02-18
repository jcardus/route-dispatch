import { ReactNode } from 'react'
import { SpinnerCircular } from 'spinners-react'

const ButtonWithSpinner = ({
    className,
    loading,
    disabled,
    fieldProps,
    color,
    children
}: {
    className?: string
    loading: boolean
    disabled?: boolean
    fieldProps: any
    color?: string
    children: ReactNode
}) => {
    return (
        <button className={className || 'button'} disabled={loading || disabled} {...fieldProps}>
            {loading ? (
                <SpinnerCircular style={{ padding: 10 }} color={color || '#fff'} secondaryColor="rgba(0,0,0,0.0)" />
            ) : (
                children
            )}
        </button>
    )
}

ButtonWithSpinner.defaultProps = {
    disabled: false,
    fieldProps: {}
}

export default ButtonWithSpinner
