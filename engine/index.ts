import { getFileDescription, getFolderDescription, gptAPI } from "./api"
import * as path from 'path'
import { isDirectory, readFile, readFileJSON, sleep, writeFileJSON } from "../helpers/node_gm"
import { IFile } from "../types"

const rootDirOrSelectedFile = process.argv[3]
const maxQueries = process.argv[4]

const maxTokens = 4097
const bytesPerToken = 4 

export class DocumentationGenerator {
    private files: IFile[];
    private opts: { maxQueries?: number; noCmd?: boolean; apiKey?: string };
    private isStopped: boolean;

    constructor(files: IFile[], opts?: { maxQueries?: number; noCmd?: boolean; apiKey?: string }) {
        this.files = files
        this.opts = opts || {}
        this.isStopped = false
    }

    public async start(): Promise<IFile[] | undefined> {
        // Set apiKey if provided
        if (this.opts.apiKey) {
            gptAPI.setApiKey(this.opts.apiKey)
        }

        const queryFn = async (file: IFile) => {
            try {
                file.state = 'pending'
                let res = {} as any
                if (file.fullPath) {
                    file.promise = getFileDescription(file, readFile(file.fullPath) || '')
                    res = await file.promise
                } else {
                    const children = this.files.filter(res => ((res.path && res.path.startsWith(file.path)) || file.path === ".") && res.path !== file.path && !res.used)
                    const childrenPromises = children.map((child) => child.promise)
                    while (children.some((el) => el.state !== 'done' && el.state !== 'error')) {
                        file.promise = Promise.allSettled(childrenPromises) as any
                        await file.promise
                        await sleep(0)
                    }
                    const childrenWithDescriptions = children.filter(res => (res.description || res.state === 'error') && !res.used)
                    const descriptions = childrenWithDescriptions.map((pathOne) => ({ fileName: pathOne.path, description: (pathOne.description || `Size: ${pathOne.size} bytes`) || '' }))
                    file.promise = getFolderDescription(file, descriptions,)
                    childrenWithDescriptions.forEach((pathOne) => {
                        pathOne.used = true
                    })
                    res = await file.promise
                }
                file.description = res?.description
                file.prompt = res.prompt
                file.state = 'done'
            } catch (e) {
                console.error('catch', { e })
                file.state = 'error'
            }
        }

        // const beforeEnd = () => {
        //     const parentFolders = getParentFolders(this.files.map(file => file.path)).filter((pathOne) => this.files.find((file) => file.path === pathOne) === undefined)
        //     this.files.push(...parentFolders.map(folder => ({ path: folder })))
        // }

        await this.semaphore(this.files, queryFn, this.opts.maxQueries || 5)

        if (!this.opts.noCmd) {
            writeFileJSON(path.resolve(__dirname, '../data/res.json'), this.files)
            process.exit(-1)
        } else {
            return this.files
        }
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

// export async function recursiveDocumentation(filesArr: IFile[], opts?: { maxQueries?: number, noCmd?: boolean, apiKey?: string }) {
//     if (opts?.apiKey) {
//         gptAPI.setApiKey(opts.apiKey)
//     }
//     // const files = isDirectory(rootDirOrSelectedFile) ? getFilesInDirectory(rootDirOrSelectedFile, rootDirOrSelectedFile) : readFileJSON(rootDirOrSelectedFile)
//     const files = filesArr
//     const results = [] as any[]
//     const currentIndex = 0

//     const queryFn = async (file: IFile) => {
//         try {
//             file.state = 'pending'
//             if (file.fullPath) {
//                 file.description = await getFileDescription(file.path, readFile(file.fullPath) || '')
//             } else {
//                 file.description = await getFolderDescription(file.path, files.filter(res => res.path && res.path.startsWith(file.path)).map((pathOne) => ({ fileName: pathOne.path, description: pathOne.description || '' })))
//             }
//             file.state = 'done'
//         } catch (e) {
//             console.error("catch", {e})
//             file.state = 'error'
//         }
//     }

//     const beforeEnd = () => {
//         const parentFolders = getParentFolders(files.map(file => file.path)).filter((pathOne) => files.find((file) => file.path === pathOne) === undefined)
//         files.push(...parentFolders.map(folder => ({ path: folder })))
//     }

//     await semaphore(files, queryFn, opts?.maxQueries || 5, beforeEnd)

//     if (!opts?.noCmd) {
//         writeFileJSON(path.resolve(__dirname, "../data/res.json"), results)
//         process.exit(-1)
//     } else {
//         return files
//     }
// }

// recursiveDocumentation(rootDirOrSelectedFile)

setTimeout(() => 9999999)
