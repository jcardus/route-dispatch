import { Route } from "../../types/Models"

export type RouteSource = 'FedEx' | 'Manual' | 'Spreadsheet'
const propName = 'created_via'
export const getAnalyticsRouteSource = (createdVia: Route[typeof propName]): RouteSource => {
    switch(createdVia) {
        case 'IMPORT_FEDEX':
        case 'IMPORT_GENERIC':
            return 'Spreadsheet'
        case 'SYNC_FEDEX':
            return 'FedEx'
        default:
            return 'Manual'
    }
}