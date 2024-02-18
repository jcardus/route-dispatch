import * as straightaway from './apis/straightaway'

export const DriverStatuses = {
    AVAILABLE: 'Available',
    DISPATCH_ASSIGNED: 'Dispatch Assigned'
}

export async function getDrivers() {
    const response = await straightaway.fetchDrivers()
    return response.data
}

export async function inviteDriver(phone_number: string, given_name: string, family_name: string) {
    const response = await straightaway.inviteDriver({
        phone_number,
        given_name,
        family_name
    })
    return response.data
}

export async function deleteDriver(driverId: string) {
    const response = await straightaway.deleteDriver(driverId)
    return response.data
}
