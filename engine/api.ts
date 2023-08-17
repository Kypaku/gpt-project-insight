import SimpleAPI from 'gpt-simple-api-ts'
// import SimpleAPIBrowser from 'gpt-simple-api-ts/lib/browser'
import { IFile } from '../types'

export const gptAPI = new SimpleAPI({ key: '' })
export const gptAPIBrowser = new SimpleAPI({ key: '' })

export interface IFileDescription {
    fileName: string
    description: string
}

export interface DescriptionResponse {
    prompt: string
    description: string
}
const timeout = 30000

const timeoutPromise = (timeout) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error('Timeout'))
        }, timeout)
    })
}

export const getFileDescription = async (file: IFile, content: string, opts?: any): Promise<DescriptionResponse> => {
    const api = opts?.browser ? gptAPIBrowser : gptAPI
    const prompt = `Create a short description for the file ${file.path}:
    ${content}
    `
    const gptOpts = { max_tokens: opts?.maxTokens || 150, temperature: opts?.temperature || 0.01 } as any
    if (opts?.model) {
        gptOpts.model = opts?.model
    }
    const gptRequest = api.getFirst(prompt, gptOpts)
    const description = (await Promise.race([gptRequest, timeoutPromise(opts?.timeout || timeout)])) as any || ""
    return { description, prompt }
}

export const getFolderDescription = async (file: IFile, descriptions: IFileDescription[], opts?: any): Promise<DescriptionResponse> => {
    const api = opts?.browser ? gptAPIBrowser : gptAPI

    const prompt = `I will send you the directory name and files it contains and their's descriptions and you will have to create a short description for the directory:
        Directory name: ${file.path}
        ${descriptions.map(desc => `
        ${desc.fileName}: 
        ${desc.description}`).join("\n")}
    `
    const gptOpts = { max_tokens: opts?.maxTokens || 300, temperature: opts?.temperature || 0.01 } as any
    if (opts?.model) {
        gptOpts.model = opts?.model
    }
    const gptRequest = api.getFirst(prompt, gptOpts)
    const description = await Promise.race([gptRequest, timeoutPromise(opts?.timeout || timeout)]) as any || ""
    return { description, prompt }
}

export const getAnswer = async (prompt: string, opts?: any): Promise<string> => {
    const api = opts?.browser ? gptAPIBrowser : gptAPI
    const gptRequest = opts?.stream === false ? api.getFirst(prompt, opts) : api.getStream(prompt, opts?.fData, opts?.fEnd, opts)
    // const answer = await Promise.race([gptRequest, timeoutPromise(opts?.timeout || timeout)]) as any || ""
    const answer = await gptRequest || ''
    return answer
}
