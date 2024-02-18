import {Fleet, User} from '@/types/Models'
import * as straightaway from './apis/straightaway'

const appEndpoint = process.env.REACT_APP_MAPBOX_APP_ENDPOINT!

export async function signOut() {
    const url = appEndpoint + `api/logout`
    return await fetch(url, { method: 'DELETE', credentials: 'include' })
}

export async function getCurrent() {
    try {
        const user = await straightaway.fetchUser()
        return user.data
    } catch (err) {
        return null
    }
}

export async function updateUser(updatedUser: Partial<User>) {
    if (updatedUser.fleet) {
        if (!updatedUser.fleet.start_persistent) {
            // cast to any since this is the only case where we allow a different value to be set
            updatedUser.fleet.start_persistent = { reset: true } as any
        }

        if (!updatedUser.fleet.end_persistent) {
            // cast to any since this is the only case where we allow a different value to be set
            updatedUser.fleet.end_persistent = { reset: true } as any
        }
    }

    return await straightaway.updateUser(updatedUser)
}
