import { DocumentationGenerator, DocumentationGeneratorOptions } from "."
import { getFilesInDirectory } from "../helpers"
import { existFile, isDirectory, readFileJSON, writeFileJSON } from "../helpers/node_gm"
import * as path from 'path'
import { program } from 'commander'

program
    .option('--maxTokens <maxTokens>', 'the maximum number of tokens that the model can accept')
    .option('--bytesPerToken <bytesPerToken>', 'approximate number of bytes in one token')
    .option('--maxQueries <maxQueries>', 'Maximum number of requests simultaneously')
    .option('--outFile <outFile>', 'The file to write the result')
    .option('--config <config>', 'The file to read the config from')
    .option('--maxTokensFile <maxTokensFile>', 'The max tokens values for files')
    .option('--maxTokensDir <maxTokensDir>', 'The max tokens values for directories')
    .option('--bytesPerToken <bytesPerToken>', 'approximate number of bytes in one token')
    .option('--temperature <temperature>', 'The temperature of the model')
    .option('--model <model>', 'The model to use')
    .parse(process.argv)

const rootDirOrSelectedFile = process.argv[3]
const apiKey = process.argv[2]

async function main(rootDirOrSelectedFile: string) {
    const isDir = isDirectory(rootDirOrSelectedFile)
    const cliOptions = program.opts();
    const configFile = cliOptions?.config || (isDir ? path.resolve(rootDirOrSelectedFile, "docs.ai.config.json") : path.resolve(__dirname, "docs.ai.config.json"))
    const config: DocumentationGeneratorOptions & {outFile?: string} = existFile(configFile) ? readFileJSON(configFile) : null

    const maxQueries = +cliOptions?.maxQueries || config?.maxQueries || 5
    const maxTokens = +cliOptions?.maxTokens || config?.maxTokens || 4097
    const bytesPerToken = +cliOptions?.bytesPerToken || config?.bytesPerToken || 4
    const temperature = +cliOptions?.temperature || config?.temperature
    const model = cliOptions?.model || config?.model
    const maxTokensFile = +cliOptions?.maxTokensFile || config?.maxTokensFile
    const maxTokensDir = +cliOptions?.maxTokensDir || config?.maxTokensDir

    const options = {
        maxQueries,
        apiKey,
        cli: true,
        maxTokens,
        bytesPerToken,
        temperature,
        model,
        maxTokensFile,
        maxTokensDir
    }

    console.log("main", {options})

    const files = isDir ? getFilesInDirectory(rootDirOrSelectedFile, rootDirOrSelectedFile) : readFileJSON(rootDirOrSelectedFile)
    const generator = new DocumentationGenerator(files, options)
    await generator.start()
    const resFile = cliOptions?.outFile || config?.outFile || (isDir ? path.resolve(rootDirOrSelectedFile, "docs.ai.json") : path.resolve(__dirname, "docs.ai.json"))
    writeFileJSON(resFile, files.map((selectedFile) => ({ path: selectedFile.path, description: selectedFile.description, size: selectedFile.size })))
    console.log("Done! The result in the file:", resFile)
}

// Wrap your async function in an async IIFE
(async () => {
    try {
        await main(rootDirOrSelectedFile)
    } catch (error) {
        console.error('Error occurred:', error)
        process.exit(1)
    }
    console.log('Async function completed successfully')
    process.exit(0)
})()
