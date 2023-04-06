import { DocumentationGenerator } from "."
import { getFilesInDirectory } from "../helpers"
import { isDirectory, readFileJSON, writeFileJSON } from "../helpers/node_gm"
import * as path from 'path'

const apiKey = process.argv[2]
const rootDirOrSelectedFile = process.argv[3]
const maxQueries = +process.argv[4] || 5

async function main(rootDirOrSelectedFile: string) {
    const files = isDirectory(rootDirOrSelectedFile) ? getFilesInDirectory(rootDirOrSelectedFile, rootDirOrSelectedFile) : readFileJSON(rootDirOrSelectedFile)
    const generator = new DocumentationGenerator(files, {maxQueries, apiKey, cli: true})
    await generator.start()
    const resFile = isDirectory(rootDirOrSelectedFile) ? path.resolve(rootDirOrSelectedFile, "docs.ai.json") : path.resolve(__dirname, "docs.ai.json")
    writeFileJSON(resFile, files.map((selectedFile) => ({path: selectedFile.path, description: selectedFile.description, size: selectedFile.size})))
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
