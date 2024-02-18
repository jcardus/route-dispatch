// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const appEndpoint = process.env.REACT_APP_APP_ENDPOINT

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
    const url = appEndpoint + `/api/session?_=${Math.round(Date.now())}`
    const response = await fetch(url, { credentials: 'include' })

    if (!response.ok) {
        const errorJson = await response.json()
        throw new Error(errorJson.message ?? response)
    }

    return await response.json()
}

async function getTokens(): Promise<MapboxToken> {
    const url = appEndpoint + 'core/tokens/v1'
    const response = await fetch(url, { credentials: 'include' })

    if (!response.ok) {
        const errorJson = await response.json()
        throw new Error(errorJson.message ?? response)
    }

    return await response.json()
}
