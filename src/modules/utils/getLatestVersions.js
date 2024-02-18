export const getLatestVersions = (routes) => {
    const latestVersions = routes.reduce((routes, currentVersion) => {
        const selectedVersion = routes[currentVersion.id]
        if (selectedVersion) {
            if (currentVersion.version > selectedVersion.version) {
                routes[currentVersion.id] = currentVersion
            }
        } else {
            routes[currentVersion.id] = currentVersion
        }
        return routes
    }, {})
    const filteredRoutes = Object.keys(latestVersions).map((version) => latestVersions[version])
    return filteredRoutes
}