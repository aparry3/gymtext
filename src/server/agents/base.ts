import { UserWithProfile } from "../models";

export interface Agent<T> {
    invoke: ({user, context}: {user: UserWithProfile, context: T}) => Promise<{user: UserWithProfile, context: T}>;
}