import { useState } from 'react'
import CheckIcon from './icons/CheckIcon'

const ToggleButton = ({ children, onSetChecked }) => {
    const [isChecked, setIsChecked] = useState()

    const buttonClass = isChecked ? 'bg-blue-light border-blue-light text-blue' : 'border-gray-lighter'

    return (
        <button
            className={`h-8 rounded-full px-3 flex whitespace-nowrap items-center border ${buttonClass}`}
            role="checkbox"
            aria-checked={isChecked}
            onClick={() => {
                const newValue = !isChecked
                setIsChecked(newValue)
                onSetChecked(newValue)
            }}
        >
            {isChecked && (
                <div className="mr-1">
                    <CheckIcon />
                </div>
            )}
            {children}
        </button>
    )
}

export default ToggleButton
