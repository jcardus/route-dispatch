export interface MapboxSession {
    email: string
    id: string
    customerID: string
    avatar: string
    authorizations: {
        client: string
        id: string
        token: string
    }[]
}

export interface MapboxToken {
    token: string
}

export async function login(): Promise<any> {
    return getSession()
}


export function getCachedLoginValues(): { session?: MapboxSession; token?: MapboxToken } {
    const value: { session?: MapboxSession; token?: MapboxToken } = {}
    const sessionJson = window.localStorage.getItem('mapbox_session')
    const tokenJson = window.localStorage.getItem('mapbox_token')
    if (sessionJson) {
        value.session = JSON.parse(sessionJson)
    }
    if (tokenJson) {
        value.token = JSON.parse(tokenJson)
    }
    return value
}

async function getSession(): Promise<any> {
    const url = '/api/session'
    const response = await fetch(url, { credentials: 'include' })

    if (!response.ok) {
        const errorJson = await response.text()
        throw new Error(errorJson)
    }

    return await response.json()
}
