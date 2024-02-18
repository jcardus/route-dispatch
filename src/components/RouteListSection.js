import RouteListItem from './RouteListItem'

const RouteListSection = ({ label, routes }) => {
    return (
        <>
            <tr className="bg-gray-lightest">
                <th colSpan="6" className="px-4 py-2 text-left text-sm text-gray border-b border-gray-lighter">
                    {label}
                </th>
            </tr>
            {routes.length > 0 && routes.map((route) => <RouteListItem key={route.id} route={route} />)}
        </>
    )
}

export default RouteListSection
