const wasDispatchedToday = (route) => {
    if (route.status !== 'CLOSED') {
        return false
    }
    const today = new Date()
    const updated = new Date(route.updated_at)

    return (
        today.getFullYear() === updated.getFullYear() &&
        today.getMonth() === updated.getMonth() &&
        today.getDate() === updated.getDate()
    )
}

export const getActiveVersions = (routes) => {
    const activeVersions = routes.reduce((routes, currentVersion) => {
        const selectedVersion = routes[currentVersion.id]
        if (selectedVersion) {
            if (!wasDispatchedToday(selectedVersion) && currentVersion.version > selectedVersion.version) {
                routes[currentVersion.id] = currentVersion
            }
        } else {
            routes[currentVersion.id] = currentVersion
        }
        return routes
    }, {})
    const filteredRoutes = Object.keys(activeVersions).map((version) => activeVersions[version])
    return filteredRoutes.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
}