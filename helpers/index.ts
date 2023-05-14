import * as fs from 'fs'
import * as path from 'path'
import { getFileSize } from './node_gm'
import { IFile } from '../types'
import { DocumentationGeneratorOptions } from '../engine';

export interface NestedFile extends IFile {
    name: string;
    path: string;
    children: NestedFile[] | null;
}

export function getFilesInDirectory(rootDir, directory, excludes: string[] = ['node_modules', ".git", "dist"]): IFile[] {
    let files = [] as IFile[]

    fs.readdirSync(directory).forEach(file => {
        const absolutePath = path.join(directory, file)
        if (fs.statSync(absolutePath).isDirectory()) {
            if (!excludes.includes(file)) {
                files = files.concat(getFilesInDirectory(rootDir, absolutePath))
            }
        } else {
            files.push({
                path: path.relative(rootDir, absolutePath),
                fullPath: path.resolve(absolutePath),
                size: getFileSize(absolutePath) || 0,
                state: undefined,
                description: ''
             })
        }
    })

    return files
}

export function generateNestedFiles(files: IFile[]): NestedFile[] {
    const root: NestedFile = { path: '', fullPath: '', size: 0, name: '', children: [] }

    files.forEach(file => {
        const parts = file.path.split(path.sep)
        let current = root

        parts.forEach((part, index) => {
            const isFile = index === parts.length - 1

            if (isFile) {
                current.children?.push({ ...file, name: part, path: parts.slice(0, index + 1).join(path.sep), children: null })
            } else {
                let dir = current.children?.find(child => child.name === part)

                if (!dir) {
                    dir = { path: '', fullPath: '', size: 0, name: part, children: [] }
                    current.children?.push(dir)
                }

                current = dir
            }
        })
    })

    return root.children || []
}

export function getParentFolders(fileList: string[]): string[] {
    const fileCounts: Record<string, number> = {}
    const newFileList = [...fileList]

    for (const filePath of newFileList) {
        const dirPath = path.dirname(filePath)
        fileCounts[dirPath] = (fileCounts[dirPath] || 0) + 1
        if (!newFileList.includes(dirPath)) {
            newFileList.push(dirPath)
        }
    }

    const parentFolders = Object.keys(fileCounts).filter((dirPath) => {
        return fileCounts[dirPath] > 1
    })
    return [...parentFolders].reverse()
}

export function getUpdatedParentFolders(fileList: string[], prevList: string[]): string[] {
    const fileCounts: Record<string, number> = {}
    const prevFileCounts: Record<string, number> = {}

    const newFileList = [...fileList]
    const newPrevFileList = [...prevList]

    for (const filePath of newFileList) {
        const dirPath = path.dirname(filePath)
        fileCounts[dirPath] = (fileCounts[dirPath] || 0) + 1
        if (!newFileList.includes(dirPath)) {
            newFileList.push(dirPath)
        }
    }
    for (const filePath of newPrevFileList) {
        const dirPath = path.dirname(filePath)
        prevFileCounts[dirPath] = (prevFileCounts[dirPath] || 0) + 1
        if (!newPrevFileList.includes(dirPath)) {
            newPrevFileList.push(dirPath)
        }
    }

    const parentFolders = Object.keys(fileCounts).filter((dirPath) => {
        return fileCounts[dirPath] + prevFileCounts[dirPath] > 1
    })
    return [...parentFolders].reverse()
}

export function exclude (files: IFile[], excludes: string, opts: Partial<DocumentationGeneratorOptions>): IFile[] {
    return files.filter((file) => {
        const excludesCondition = excludes
            .split(",")
            .map((el) => el.trim())
            .every((exclude) => {
                if (exclude.startsWith("*")) {
                    if (exclude.endsWith("*")) {
                        return !file.path.includes(exclude.slice(1, -1))
                    }
                    return !file.path.endsWith(exclude.slice(1))
                } else {
                    return !file.path.startsWith(exclude)
                }
            })
        const maxSizeCondition = ((file.size || 0) <= ((opts?.maxTokens || 4097) - (opts?.maxTokensFile || 150)) * (opts?.bytesPerToken || 4))
        return maxSizeCondition && ((!excludes) || excludesCondition)
    })
}

export function lengthToTokensCount(l: number): number {
    return Math.ceil(l / 4)
}

export const copyToClipboard = (str: string) => {
    const el = document.createElement("textarea")
    el.value = str
    el.setAttribute("readonly", "")
    el.style.position = "absolute"
    el.style.left = "-9999px"
    document.body.appendChild(el)
    let selected: Range|boolean = false
    const selection = document.getSelection()
    if (selection != null) {
        selected = selection.rangeCount > 0 ? selection.getRangeAt(0) : false
    }
    el.select()
    document.execCommand("copy")
    document.body.removeChild(el)
    if (selected && selection) {
        selection.removeAllRanges()
        selection.addRange(selected)
    }
}

export const copy = (content: string) => {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(content || "")
            .then(() => {
                console.log("Text copied to clipboard")
                // toast("The link copied in to clipboard", { position: "bottom-right", theme: "colored" })
            })
            .catch((error) => {
                console.error("Error copying text: ", error)
            })
    } else {
        copyToClipboard(content || "")
    }
}
