import { readFileJSON } from "../helpers/node_gm"
import { IFile } from "../types"
import { gptAPI } from "./api"

export interface InsightOptions {
    apiKey?: string
    cli?: boolean
    fileNames?: string[]
    mode: 'singlePrompt' | 'chat'
}

export class Insight {
    private documentation: IFile[];
    private opts: Partial<InsightOptions>;
    private isStopped: boolean;

    constructor(documentation: IFile[], opts?: InsightOptions) {
        this.documentation = documentation
        this.opts = opts || {}
        this.isStopped = false
    }

    public async insight(prompt: string, opts?: InsightOptions): Promise<string> {
        if (this.opts.apiKey) {
            gptAPI.setApiKey(this.opts.apiKey)
        }
        const thePrompt = `I give a question: "${prompt}"
And the list of files:
${(opts?.fileNames || []).join('\n')}
You need to decide you have enough information to answer the question or not.
If you have enough information, you can answer the question.
If you don't have enough information, you need to ask about descriptions of what exactly files do you need.
Use the format: {needFilesDescriptions: [file1, file2, ...]}}`
        // call the first prompt
        console.log("insight", {thePromptLength: thePrompt.length / 4})
        const res = await gptAPI.getFirst(thePrompt)
        return res || ''
    }

    public stop(): void {
        this.isStopped = true
    }
}
