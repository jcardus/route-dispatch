export interface Dispatch {
    id: string
    route_id: string
    route_version: number
    driven_by: string
    title: string
    status: DispatchStatus
    recordings: any[]
    created_at: string
    updated_at: string
    start?: Stop
    end?: Stop
    stops: Stop[]
}

export enum DispatchStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED'
}

export interface Driver {
    id: string
    user_group: string
    phone_number: string
    given_name: string
    family_name: string
    name?: string
    created_at: string
    updated_at: string
    fleet: {
        title: string
        driver_count_limit: number
        driver_ids: string[]
    }
}

export interface Route {
    id: string
    version: number
    title?: string
    schedule?: string
    status?: RouteStatus
    start?: Stop
    end?: Stop
    stops: Stop[]
    fedex_metadata?: {
        work_area?: string
        exported_at?: string
    }
    cloned_from?: string
    created_by_user?: {
        user_group: string
        phone_number: string
        given_name: string
        family_name: string
    }
    created_via?: 'MANUAL' | 'IMPORT_GENERIC' | 'IMPORT_FEDEX' | 'SYNC_FEDEX'
    dispatch_to?: string
    created_at: string
    updated_at: string
}

export enum RouteStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    CLOSED = 'CLOSED'
}

export enum StopStatus {
    ACTIVE = 'ACTIVE',
    MISSED = 'MISSED',
    COMPLETED = 'COMPLETED'
}

export interface Stop {
    id: string
    title?: string
    status: StopStatus
    place_name: string
    location: Coordinate
    routable_locations: Coordinate[]
    address_parsed?: Address
    unit_number?: string
    package_count?: number
    instruction_text?: string
    recipient?: {
        name: string
        phone_number: string
    }
    fedex_metadata?: {
        sid: string
        tracking_ids: string[]
    }
    order?: number
    priority?: boolean
    time_window?: {
        from: string
        to: string
    }
    completed_at?: string
}

export interface Coordinate {
    lon: number
    lat: number
}

export interface Address {
    street: string
    postal_code: string
    city: string
    district: string
    state: string
    country: string
    country_code: string
}

export interface User {
    id: string
    given_name: string // first name
    family_name: string // last name
    phone_number: string
    email?: string
    created_at: string
    updated_at: string
    user_group: string
    fleet: Fleet
    fedex_id: string | null
}

export interface Fleet {
    title: string
    driver_count_limit: number
    driver_ids: string[]
    end_persistent: Stop
    start_persistent: Stop
}

/**
 * This is a pared down version of the full `/driving-traffic` response based on the values we
 * use.
 */
export interface MapboxDirections {
    routes: {
        distance: number
        weight: number
        duration: number
    }[]
}
