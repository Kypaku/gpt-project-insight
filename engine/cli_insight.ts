
import { program } from 'commander'
import { Insight } from './insight'

program
    .option('--fileNames <fileNames>', 'The list of file names')
    .option('--mode <mode>', 'The mode of insight')
    .parse(process.argv)

const prompt = process.argv[3]
const apiKey = process.argv[2]

async function main(prompt: string) {
    const cliOptions = program.opts()
    const fileNames = cliOptions?.fileNames.split(",")
    const mode = cliOptions?.mode

    const options = {
        apiKey,
        cli: true,
        fileNames,
        mode
    }

    const insight = new Insight([], options)
    const res = await insight.insight(prompt, options)
    console.log("The result:", res)
}

// Wrap your async function in an async IIFE
(async () => {
    try {
        await main(prompt)
    } catch (error) {
        console.error('Error occurred:', error)
        process.exit(1)
    }
    console.log('Async function completed successfully')
    process.exit(0)
})()
