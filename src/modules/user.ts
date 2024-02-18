import {Fleet, User} from '@/types/Models'
import * as straightaway from './apis/straightaway'

const appEndpoint = process.env.REACT_APP_MAPBOX_APP_ENDPOINT!

export async function signOut() {
    const url = appEndpoint + `api/logout`
    return await fetch(url, { method: 'DELETE', credentials: 'include' })
}

export async function getCurrent() {
    try {
        // const user = await straightaway.fetchUser()
        return {
            "id": "jcardeira2",
            "updated_at": "2024-02-18T16:21:36Z",
            "user_group": "MANAGER",
            "created_at": "2024-02-17T21:37:53Z",
            "fleet": {
                "driver_ids": [
                    "d95a7feb-8f74-46ed-951e-03a52562c262",
                    "c5ad54c8-3a48-4bcc-bfbb-41432a46e079",
                    "3fb7a5f7-11b4-448a-b260-2dc104ef4305",
                    "4398ffb8-083a-4e8a-a0ab-e72fbfc8fb02",
                    "1755aa7c-b4fd-498f-8681-3e37108d1f5d",
                    "6b3422b1-9dd1-47f8-9392-e3eb7e75bafe",
                    "1cbeed5e-8d8c-43ba-aaff-446397e1120b",
                    "e6e9ff45-a4d2-42ef-b6c6-6ca73c5e2651",
                    "f909df84-e34f-4584-93cf-ea36bd982082",
                    "597a365b-ad17-47af-bf27-bd540c51cd62",
                    "35191ce9-1380-4dda-9e7e-16c7fc935cf8"
                ],
                "end_persistent": {
                    "place_name": "232 Southwest Harvey Milk Street, Portland, Oregon 97204, United States",
                    "reset": false,
                    "location": {
                        "lon": -122.67411,
                        "lat": 45.520346
                    },
                    "address_parsed": {
                        "country": "United States",
                        "country_code": "us",
                        "city": "Portland",
                        "street": "232 Southwest Harvey Milk Street",
                        "district": "Multnomah County",
                        "state": "Oregon",
                        "postal_code": "97204"
                    },
                    "routable_locations": [
                        {
                            "lon": -122.674198,
                            "lat": 45.520183
                        }
                    ],
                    "title": "Portland"
                },
                "start_persistent": {
                    "place_name": "232 Southwest Harvey Milk Street, Portland, Oregon 97204, United States",
                    "reset": false,
                    "location": {
                        "lon": -122.67411,
                        "lat": 45.520346
                    },
                    "address_parsed": {
                        "country": "United States",
                        "country_code": "us",
                        "city": "Portland",
                        "street": "232 Southwest Harvey Milk Street",
                        "district": "Multnomah County",
                        "state": "Oregon",
                        "postal_code": "97204"
                    },
                    "routable_locations": [
                        {
                            "lon": -122.674198,
                            "lat": 45.520183
                        }
                    ],
                    "title": "Portland"
                },
                "title": "undefined undefined's Fleet",
                "driver_count_limit": 0
            },
            "email": "administrator@fleetrack.cl",
            "name": "Fleetrack SPA"
        }
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
