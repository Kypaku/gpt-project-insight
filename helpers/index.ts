import * as fs from 'fs'
import * as path from 'path'
import { getFileSize } from './node_gm'
import { IFile } from '../types'

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
                state: 'queued',
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

    for (const filePath of fileList) {
        const dirPath = path.dirname(filePath)
        fileCounts[dirPath] = (fileCounts[dirPath] || 0) + 1
    }

    const parentFolders = Object.keys(fileCounts).filter((dirPath) => {
        return fileCounts[dirPath] > 1
    })
    return [...parentFolders].reverse()
}
