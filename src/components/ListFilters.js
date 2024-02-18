import ToggleButton from './ToggleButton'

const ListFilters = ({ filters, onFilterChecked }) => {
    return (
        <div className="h-12 flex items-center">
            <div className="mr-2">View:</div>
            {filters.map((filter) => (
                <div className="mr-2" key={filter}>
                    <ToggleButton onSetChecked={(isChecked) => onFilterChecked(filter, isChecked)}>
                        {filter}
                    </ToggleButton>
                </div>
            ))}
        </div>
    )
}

export default ListFilters
