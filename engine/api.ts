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

export const getFileDescription = async (file: IFile, content: string): Promise<DescriptionResponse> => {
    const prompt = `Create a short description for the file ${file.path}:
        ${content}
    `
    const gptRequest = gptAPI.getFirst(prompt, { max_tokens: 150, temperature: 0.01 })
    const description = (await Promise.race([gptRequest, timeoutPromise(timeout)])) as any || ""
    return { description, prompt }
}

export const getFolderDescription = async (file: IFile, descriptions: IFileDescription[]): Promise<DescriptionResponse> => {
    const prompt = `I will send you the directory name and files it contains and their's descriptions and you will have to create a short description for the directory:
        Directory name: ${file.path}
        ${descriptions.map(desc => `
        ${desc.fileName}: 
        ${desc.description}`).join("\n")}
    `
    const gptRequest = gptAPI.getFirst(prompt, { max_tokens: 300, temperature: 0.01 })
    const description = await Promise.race([gptRequest, timeoutPromise(timeout)]) as any || ""
    return { description, prompt }
}
