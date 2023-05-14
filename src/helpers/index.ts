const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

export const ROOT_DIR = path.resolve(__dirname, '..', '..', '..', '..', '..', '..')
// replace all files in text with string <a>file</a>
export function wrapFilesInString(text: string, files: string[]): string {
    return text.replaceAll(new RegExp(files.join('|'), 'g'), (match) => {
        return `<a href='#' class='underline file'>${match}</a>`
    })
}

export function indexesOf(string: string, substring: string): number[] {
    const a = []; let i = -1
    while ((i = string.indexOf(substring, i + 1)) >= 0) a.push(i)
    return a
}

