import { getFileDescription, getFolderDescription, gptAPI } from "./api"
import * as path from 'path'
import { isDirectory, readFile, readFileJSON, sleep, writeFileJSON } from "../helpers/node_gm"
import { IFile } from "../types"
import { getParentFolders, getUpdatedParentFolders } from "../helpers"

export interface DocumentationGeneratorOptions {
    maxQueries?: number
    maxTokensModel?: number
    maxTokensAnswer?: number
    apiKey?: string
    cli?: boolean
    maxTokens?: number
    maxTokensFile?: number
    maxTokensDir?: number
    bytesPerToken?: number
    temperature?: number
    model?: string
    timeout?: number
    language?: string
}
export class DocumentationGenerator {
    private files: IFile[];
    private prevResult: IFile[];
    private opts: DocumentationGeneratorOptions;
    private isStopped: boolean;

    constructor(files: IFile[], opts?: DocumentationGeneratorOptions, prevResult?: IFile[]) {
        this.files = files
        this.opts = opts || {}
        this.isStopped = false
        this.prevResult = prevResult || []
    }

    public async start(): Promise<IFile[] | undefined> {
        // Set apiKey if provided
        if (this.opts.apiKey) {
            gptAPI.setApiKey(this.opts.apiKey)
        }
        if (this.opts.cli) {
            if (this.prevResult.length) {
                const parentFolders = getUpdatedParentFolders(this.files.map((file) => file.path), this.prevResult.map((file) => file.path))
                const parentItems = parentFolders
                    .map(folder => ({ path: folder }))
                this.files.push(...parentItems)
            } else {
                const parentFolders = getParentFolders(this.files.map(file => file.path)).filter((pathOne) => this.files.find((file) => file.path === pathOne) === undefined)
                this.files.push(...parentFolders.map(folder => ({ path: folder })))
            }
        }

        const queryFn = async (file: IFile) => {
            try {
                if (file.state === 'done' || file.state === 'error' || file.state === 'stopped') {
                    return
                }
                file.state = 'pending'
                let res = {} as any
                if (file.fullPath && !isDirectory(file.fullPath)) {
                    const fileOpts = { maxTokens: this.opts.maxTokensFile, temperature: this.opts.temperature, model: this.opts.model, ...this.opts }
                    file.promise = getFileDescription(file, readFile(file.fullPath) || '', fileOpts)
                    this.opts?.cli && console.log("start: " + file.fullPath)
                    res = await file.promise
                } else {
                    const children = this.files.filter(res => ((res.path && res.path.startsWith(file.path)) || file.path === ".") && res.path !== file.path && !res.used)
                    const prevChildren = this.prevResult.filter(res => ((res.path && res.path.startsWith(file.path)) || file.path === ".") && res.path !== file.path && !res.used)
                    const childrenPromises = children.map((child) => child.promise)
                    while (children.some((el) => el.state !== 'done' && el.state !== 'error')) {
                        file.promise = Promise.allSettled(childrenPromises) as any
                        await file.promise
                        await sleep(0)
                    }
                    const childrenWithDescriptions = [...prevChildren, ...children].filter(res => (res.description || res.state === 'error') && !res.used)
                    const descriptions = childrenWithDescriptions.map((pathOne) => ({ fileName: pathOne.path, description: (pathOne.description || `Size: ${pathOne.size} bytes`) || '' }))
                    const dirOpts = { maxTokens: this.opts.maxTokensDir, temperature: this.opts.temperature, model: this.opts.model, ...this.opts }
                    this.opts?.cli && console.log("start folder: " + file.path)
                    file.promise = getFolderDescription(file, descriptions, dirOpts)
                    childrenWithDescriptions.forEach((pathOne) => {
                        pathOne.used = true
                    })
                    res = await file.promise
                }
                file.description = res?.description
                file.prompt = res.prompt
                file.state = 'done'
            } catch (e) {
                console.error('catch', file.path, e.message)
                file.state = 'error'
            }
        }

        // const beforeEnd = () => {
        //     const parentFolders = getParentFolders(this.files.map(file => file.path)).filter((pathOne) => this.files.find((file) => file.path === pathOne) === undefined)
        //     this.files.push(...parentFolders.map(folder => ({ path: folder })))
        // }

        await this.semaphore(this.files, queryFn, this.opts.maxQueries || 5)

        return this.files
    }

    public stop(): void {
        this.isStopped = true
    }

    private async semaphore(files: IFile[], queryFn: (file: IFile) => Promise<void>, maxSimultaneous: number): Promise<void> {
        const results = new Array(files.length)
        let activeQueries = 0
        let currentIndex = 0

        return new Promise((resolve) => {
            const enqueue = async () => {
                // if (currentIndex === files.length) {
                //     beforeEnd()
                // }
                if (currentIndex === files.length) {
                    if (activeQueries === 0) {
                        resolve()
                    }
                    return
                }

                if (this.isStopped) {
                    files.forEach((file) => {
                        (!file.state || file.state === 'queued') && (file.state = 'stopped')
                    })
                    resolve()
                    return
                }

                const index = currentIndex++
                const query = files[index]
                activeQueries++

                await queryFn(query)
                activeQueries--

                enqueue()
            }

            for (let i = 0; i < maxSimultaneous; i++) {
                enqueue()
            }
        })
    }
}
