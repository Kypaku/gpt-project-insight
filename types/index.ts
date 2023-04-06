import { DescriptionResponse } from "../engine/api"

export interface IFile {
    fullPath?: string
    path: string
    size?: number
    description?: string
    state?: 'queued' | 'pending' | 'done' | 'error' | 'stopped'
    prompt?: string
    used?: boolean
    promise?: Promise<DescriptionResponse>
}
