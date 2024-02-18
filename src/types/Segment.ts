import { track as _track } from '../modules/apis/segment'

export namespace Segment {
    export namespace Optimization {
        type BaseType = {
            name: string
            route_id: string
            route_version: number
        }

        export type ProblemSubmittedType = {
            name: 'Route Optimize Start'
        } & BaseType

        export type SolutionPollType = {
            name: 'Route Optimize Poll'
            attemptCount: number
        } & BaseType

        export type Success = {
            name: 'Route Optimize Optimized'
            optimization_problem_id: string
            computing_time: number // Time to compute
            time_before: number // Travel time before optimization started in seconds
            time_after: number // Travel time after optimization started in seconds
            optimized_order: number[] // Array of reordered stop indices (e.g. [4,7,1,6,3,9]
            distance_before: number
            distance_after: number
            number_of_stops: number
            estimated_time_saved: number
            estimated_distance_saved: number
        } & BaseType

        export type Cancelled = {
            name: 'Route Optimize Cancelled'
        } & BaseType

        export type Error = {
            name: 'Error Error Optimizing'
            number_of_stops: number
            optimization_problem_id?: string
            reason: string
        } & BaseType
    }
}

export function track<T extends Event>(event: T['name'], payload: Omit<T, 'name'>) {
    _track(event, payload)
}

export type Event =
    | Segment.Optimization.ProblemSubmittedType
    | Segment.Optimization.SolutionPollType
    | Segment.Optimization.Success
    | Segment.Optimization.Cancelled
    | Segment.Optimization.Error
