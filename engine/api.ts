import SimpleAPI from 'gpt-simple-api-ts'
import { IFile } from '../types'

export const gptAPI = new SimpleAPI({ key: '' })

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
    const prompt = `Create a short description for the file ${file.path}:
    ${content}
    `
    const gptOpts = { max_tokens: opts?.maxTokens || 150, temperature: opts?.temperature || 0.01 } as any
    if (opts?.model) {
        gptOpts.model = opts?.model
    }
    const gptRequest = gptAPI.getFirst(prompt, gptOpts)
    const description = (await Promise.race([gptRequest, timeoutPromise(opts?.timeout || timeout)])) as any || ""
    return { description, prompt }
}

export const getFolderDescription = async (file: IFile, descriptions: IFileDescription[], opts?: any): Promise<DescriptionResponse> => {
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
    const gptRequest = gptAPI.getFirst(prompt, gptOpts)
    const description = await Promise.race([gptRequest, timeoutPromise(opts?.timeout || timeout)]) as any || ""
    return { description, prompt }
}

export const getAnswer = async (prompt: string, opts?: any): Promise<string> => {
    const gptRequest = opts?.stream === false ? gptAPI.getFirst(prompt, opts) : gptAPI.getStream(prompt, opts?.fData, opts?.fEnd)
    const answer = await Promise.race([gptRequest, timeoutPromise(opts?.timeout || timeout)]) as any || ""
    return answer
}
