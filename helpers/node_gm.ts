import _, { groupBy } from 'lodash'
import * as fs from 'fs'
import * as readline from 'readline'
import * as path from 'path'
import * as mkdirp from 'mkdirp'
import { exec, spawn, spawnSync } from 'child_process'

const { uniq, sortBy } = _
//* as fs

/* Consts */

/* General */
/* Arrays */
export function objectEach(obj: { [key: string]: unknown }, f: (el: unknown) => unknown) {
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            obj[key] = f(obj[key])
        }
    }
}

export function objectMap(obj: { [key: string]: any }, f: (el: any, key: string) => any, level?: number) {
    if (level && level > 1) {
        const newObj = { ...obj }
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                newObj[key] = objectMap(obj[key], f, level - 1)
            }
        }
        return newObj
    } else {
        const newObj = { ...obj }
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                newObj[key] = f(obj[key], key)
            }
        }
        return newObj
    }
}

export function transpose<T>(matrix: T[][]): T[][] {
    return matrix[0].map((x, i) => matrix.map(x => x[i]))
}

export function last(arr: any[]) {
    return arr[arr.length - 1]
}

export function shrinkRight<T>(matrix: T[][]): T[][] {
    const len = Math.min(...matrix.map(el => el.length))
    return matrix.map(el => el.slice(0, len))
}

export function shrinkLeft<T>(matrix: T[][]): T[][] {
    const len = Math.min(...matrix.map(el => el.length))
    return matrix.map(el => el.slice(el.length - len))
}

export interface TallySortByItem<T, R> {
    baseValues: T[]
    value: R;
    count: number;
}

export interface TallySortItem {
    value: any;
    count: number;
}
export interface TallySortRelativeItem {
    value: any;
    percent: number;
}

export function tallySort<T>(arr: T[], f?: (el: T) => any, fInv?: (el: any) => any): TallySortItem[] {
    return Object.entries(_.countBy(arr, f))
        .map(el => { return { value: fInv ? fInv(el[0]) : el[0], count: el[1] as number } })
        .sort((a, b) => +b.count - +a.count)
}

export const tallySortJSON = (arr: any[]) => tallySort(arr, JSON.stringify, JSON.parse)


export function tallySortRelative(ts: TallySortItem[], totalValue?: number): TallySortRelativeItem[] {
    const _total = totalValue || total(ts, 'count')
    return ts.map(({ value, count }) => ({ value, percent: count / _total }))
}

export const total = function (arr: (any[]), key?: string): number {
    let _arr = arr
    if (key) {
        _arr = (arr as any[]).map((el) => el[key])
    }
    return _arr.reduce((a, b) => a + b, 0)
}

export const splitBy = function(arr: any[], f: (el: any, local: any[]) => boolean, g?: (local: any[]) => any) {
    const res = [] as any[]
    let local: any[] = []
    g = g || ((el) => el)
    arr.forEach(el => {
        local.push(el)
        if (f(el, local)) {
            res.push(g && g(local))
            local = []
        }
    })
    if (local.length) {
        res.push(g(local))
    }
    return res
}

export const split = function(arr: any[], f: (el: any, local: any[]) => any, g?: (local: any[]) => any) {
    const res = [] as any
    let local: any[] = []
    g = g || ((el) => el)
    let testValue: any = null
    arr.forEach((el, i) => {
        if (i && testValue !== f(el, local)) {
            res.push(g ? g(local) : local)
            local = []
        }
        local.push(el)
        testValue = f(el, local)
    })
    if (local.length) {
        res.push(g(local))
    }
    return res
}

export function sortSplit<T, R>(arr: T[], f:(el: T) => R): T[][] {
    return split(sortBy(arr, f), f)
}

// export const sortSplit = (arr: any[], f: (el: any, local: any[]) => any, g?: (local: any[]) => any) => split(sortBy(arr, f), f, g)
export const sortSplitReverse = (arr: any[], f: (el: any, local: any[]) => any, g?: (local: any[]) => any) => split(sortByReverse(arr, f as any), f, g)

export const accamulateByKey = function(arr: any[], key: string) {
    const res: any[] = []
    arr.forEach(o => {
        res.push({ date: o.date, [key]: last(res) ? last(res)[key] + o[key] : o[key] })
    })
    return res
}

export const partition = function (arr: any[], n: number) {
    let i = 0
    const res = [] as any[]
    let locale = [] as any[]
    for (const el of arr) {
        locale.push(el)
        i++
        if (!(i % n)) {
            res.push(locale)
            locale = []
        }
    }
    locale.length && res.push(locale)
    return res
}

export const partitionShift = function (arr: any[], n: number, shift = 1) {
    // now works only for shift == 1
    const res = [] as any[]
    let locale = [] as any[]
    for (let i = 0; i < arr.length; i++) {
        const el = arr[i]
        locale.push(el)
        if (!((i + 1) % (n + res.length))) {
            res.push(locale)
            locale = []
            i = i - n + shift
        }
    }
    locale.length && res.push(locale)
    return res
}

export function sortByReverse<T>(arr: T[], f: ((el: T) => any) | string): T[] {
    return sortBy(arr, f).reverse()
}

export function permutations(collection: any[], n: number) {
    const array = _.values(collection)
    if (array.length < n) {
        return []
    }
    const recur = (array: any[], n: number) => {
        if (--n < 0) {
            return [[]]
        }
        const p: any[] = []
        array.forEach((value, index, array) => {
            array = array.slice()
            array.splice(index, 1)
            recur(array, n).forEach(permutation => {
                permutation.unshift(value)
                p.push(permutation)
            })
        })
        return p
    }
    return recur(array, n)
}
/* Objects */
/* String */
export function toJSON(obj: {[key: string]: any}) {
    return JSON.stringify(obj)
}

export function fromJSON(json: string) {
    return JSON.parse(json)
}
export function toCamelCase(str: string) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
        if (+match === 0) return '' // or if (/\s+/.test(match)) for white spaces
        return index === 0 ? match.toLowerCase() : match.toUpperCase()
    })
}

export function pascalCase(str: string): string {
    return _.upperFirst(_.camelCase(str))
}

export function JSONKeysToCamel(o: any) {
    let newO: any, origKey, newKey: string, value
    if (o instanceof Array) {
        return o.map(function(value) {
            if (typeof value === 'object') {
                value = JSONKeysToCamel(value)
            }
            return value
        })
    } else {
        newO = {}
        for (origKey in o) {
            if (o.hasOwnProperty(origKey)) {
                newKey = (origKey.charAt(0).toLowerCase() + origKey.slice(1) || origKey).toString()
                value = o[origKey]
                if (value instanceof Array || (value !== null && value.constructor === Object)) {
                    value = JSONKeysToCamel(value)
                }
                newO[newKey] = value
            }
        }
    }
    return newO
}

export const JSONtoURL = (data: any) => data && Object.keys(data).filter(k => data[k] !== undefined).map(function(k) {
    return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
}).join('&')

export function localeCompare(str1: string, str2: string) {
    return (str1.toLocaleLowerCase && str1.toLocaleLowerCase()) === (str2.toLocaleLowerCase && str2.toLocaleLowerCase())
}

export function localeIncludes(str1: string, str2: string) {
    return (str1.toLocaleLowerCase && str1.toLocaleLowerCase()).includes(str2.toLocaleLowerCase && str2.toLocaleLowerCase())
}

export function localeIncludesOr(str1: string, str2: string[]) {
    return str2.some((el) => localeIncludes(str1, el))
}

export function localeStart(str1: string, str2: string) {
    return !(str1.toLocaleLowerCase && str1.toLocaleLowerCase()).indexOf(str2.toLocaleLowerCase && str2.toLocaleLowerCase())
}

export function fileIncludes(str: string, strFile: string) {
    const strLocale = str.toLocaleLowerCase && str.toLocaleLowerCase()
    const strFileLocale = strFile.toLocaleLowerCase && strFile.toLocaleLowerCase()
    return strLocale.includes(strFileLocale) || (!!strFile.split('.')[0] && strLocale.includes(strFile.split('.')[0]))
}

export function pathCompare(path1: string, path2: string): boolean {
    path1 = path.resolve(path1)
    path2 = path.resolve(path2)
    if (process.platform == "win32") { return path1.toLowerCase() === path2.toLowerCase() }
    return path1 === path2
}

/* DataStructures */
export function multimap(arr: {[key: string]: any}[]) {
    const res = {} as {[key: string]: any[]}
    arr.forEach(obj =>
        Object.keys(obj).forEach(key => {
            if (!res[key]) {
                res[key] = [obj[key]]
            } else {
                res[key].push(obj[key])
            }
        }))
    return res
}

export function multimapF(arr: {[key: string]: any}[], f: (els: any[]) => any) {
    const mm = multimap(arr)
    Object.keys(mm).forEach(key => {
        mm[key] = f(mm[key])
    })
    return mm
}

export function multimapUniq(arr: {[key: string]: any}[]) {
    const mm = multimap(arr)
    Object.keys(mm).forEach(key => {
        mm[key] = uniq(mm[key])
    })
    return mm
}

export function multimapTallySort(arr: {[key: string]: any}[]) {
    const mm = multimap(arr)
    Object.keys(mm).forEach(key => {
        mm[key] = tallySort(mm[key])
    })
    return mm
}

/* Similarity */
export function includesSimilarity(arrA: any[], arrB: any[]): number {
    let score = 0
    const longer = arrA.length > arrB.length ? arrA : arrB
    const shorter = arrA.length > arrB.length ? arrB : arrA
    longer.forEach(el => {
        shorter.includes(el) && score++
    })
    return longer.length ? (score / longer.length) : 0
}

export function includesSimilarityByCurrentLength(currentArr: any[], testArr: any[]): number {
    let score = 0
    currentArr.forEach(el => {
        testArr.includes(el) && score++
    })
    return currentArr.length ? (score / currentArr.length) : 0
}

// includesCountSimilarity
// positionSimilarity
// orderSimilarity

// async

export async function awaitFor<T>(items: T[], f: (el: T, i: number) => void) {
    let i = 0
    for (const el of items) {
        await f(el, i)
        i++
    }
}

export async function awaitMap<T, R>(items: T[], f: (el: T, i: number) => R): Promise<R[]> {
    let i = 0
    const res = [] as any[]
    for (const el of items) {
        const _res = await f(el, i)
        res.push(_res)
        i++
    }
    return res
}

/* Files */
export function searchRegExp(base: string, re: RegExp | string | ((el: string) => boolean), files: string[] | null, result: string[], node_modules = false, maxDepth = 2, depth = 0, ignores: string[] = [], includeDirs?: boolean, condition?: (file: string) => boolean) {
    try {
        if (depth > maxDepth) return result
        files = files || fs.readdirSync(base)
        result = result || []

        files.forEach(
            function (file: string) {
                try {
                    const newbase = path.join(base, file)
                    if (fs.statSync(newbase).isDirectory() && (node_modules || file !== 'node_modules') && !(ignores.includes(file)) && (condition ? condition(newbase) : true)) {
                        result = searchRegExp(newbase, re, fs.readdirSync(newbase), result, node_modules, maxDepth, depth + 1, ignores, includeDirs, condition)
                        if (includeDirs && ((re instanceof RegExp) || typeof re === 'string' ? file.match(re) : re(newbase))) {
                            result.push(path.resolve(newbase))
                        }
                    } else {
                        if (((re instanceof RegExp) || typeof re === 'string' ? file.match(re) : re(newbase)) && (condition ? condition(newbase) : true)) {
                            result.push(path.resolve(newbase))
                        }
                    }
                } catch (ee) {
                    console.error(`Error searchRegExp cycle ${file}:` + ee)
                }
            }
        )
        return result
    } catch (e) {
        console.error('Error searchRegExp:' + e)
        return result
    }
}

export const searchR = searchRegExp

export const filesR = (dir: string, eq: RegExp | string | ((el: string) => boolean), { ignores, maxDepth, node_modules }: {ignores: string[]; maxDepth: number; node_modules?: boolean}) => searchRegExp(dir, eq, null, [], ((node_modules !== undefined) ? node_modules : true), maxDepth, 0, ignores || ['node_modules', '.git'])

export const filesAll = (dir: string, { ignores, maxDepth, node_modules }: {ignores: string[]; maxDepth: number; node_modules: boolean}) => filesR(dir, () => true, { ignores, maxDepth, node_modules })

export function getLatestFiles(dir: string, date: Date, node_modules = false, maxDepth = 3) {
    return searchR(dir, file => +new Date(getFileDate(file) as any) > +date, null, [], node_modules, maxDepth)
}
// REPLACE path to filename cuz path it is node module
export function readFile(filePath: string) {
    if (!fs.existsSync(filePath)) return
    return fs.readFileSync(filePath).toString()
}

export function readFileJSON(filePath: string) {
    if (!fs.existsSync(filePath)) return
    return JSON.parse(fs.readFileSync(filePath).toString())
}

export function readFileJSONLines(filename: string): any[] | undefined {
    if (!fs.existsSync(filename)) return
    return fs.readFileSync(filename).toString().split('\n').filter(Boolean).map((el) => JSON.parse(el))
}

export function writeFile(filename: string, data: string) {
    return fs.writeFileSync(filename, data)
}

export function writeFileJSON(filename: string, obj: any) {
    return fs.writeFileSync(filename, toJSON(obj))
}

export function appendFile(filename: string, data: string) {
    return fs.appendFileSync(filename, data)
}

export function appendFileJSON(filename: string, obj: any) {
    return fs.appendFileSync(filename, '\n' + toJSON(obj))
}

export function updateFile(filePath: string, f: (text: string | undefined) => string): string {
    const text = readFile(filePath)
    const res = f(text)
    writeFile(filePath, res)
    return res
}

export function updateFileJSON(filePath: string, f: (data: any) => any): any {
    const data = readFileJSON(filePath)
    const res = f(data)
    writeFileJSON(filePath, res)
    return res
}

async function getFirstLine(pathToFile: string) {
    const readable = fs.createReadStream(pathToFile)
    const reader = readline.createInterface({ input: readable })
    const line = await new Promise((resolve) => {
        reader.on('line', (line) => {
            reader.close()
            resolve(line)
        })
    })
    readable.close()
    return line
}

export async function readFirstChar(filePath: string) {
    const buffer = Buffer.alloc(1) // создаем буфер размером 1 байт
    const fd = await fs.promises.open(filePath, 'r') // открываем файл для чтения
    try {
        await fd.read(buffer, 0, 1, 0) // читаем первый байт из файла
    } finally {
        await fd.close() // закрываем файл
    }
    return buffer.toString() // преобразуем буфер в строку и возвращаем первый символ
}

export async function readFirstNBytes(filePath: string, n: number) {
    const buffer = Buffer.alloc(n) // создаем буфер размером n байт
    const fd = await fs.promises.open(filePath, 'r') // открываем файл для чтения
    try {
        await fd.read(buffer, 0, n, 0) // читаем первые n байт из файла
    } finally {
        await fd.close() // закрываем файл
    }
    return buffer.toString() // преобразуем буфер в строку и возвращаем первые n символов
}

export function deleteFile(filename: string) {
    return existFile(filename) && fs.unlinkSync(filename)
}

export function deleteDirectory(dir: string) {
    return fs.rmSync(dir, { recursive: true })
}

export function renameFile(filename1: string, filename2: string) {
    return fs.renameSync(filename1, filename2)
}

export function copyFile(filename1: string, filename2: string) {
    return fs.copyFileSync(filename1, filename2)
}

export function copyDirectory(filename1: string, filename2: string) {
    const exists = fs.existsSync(filename1)
    const stats = exists && fs.statSync(filename1)
    const isDirectory = exists && stats && stats.isDirectory()
    if (isDirectory) {
        fs.mkdirSync(filename2)
        fs.readdirSync(filename1).forEach(function(childItemName: string) {
            copyDirectory(path.join(filename1, childItemName),
                path.join(filename2, childItemName))
        })
    } else {
        fs.copyFileSync(filename1, filename2)
    }
}

export function getFileInfo(path: string) {
    if (!fs.existsSync(path)) return
    const stat = fs.statSync(path)
    return { path, basename: getBasename(path), ext: getFileExtension(path), isDir: stat.isDirectory(), ...stat }
}

export function getFileDate(path: string) {
    if (!fs.existsSync(path)) return
    const stat = fs.statSync(path)
    return stat.mtime
}

export function getFileCreateDate(path: string) {
    if (!fs.existsSync(path)) return
    const stat = fs.statSync(path)
    return stat.ctime
}

export function getFileSize(path: string): number | undefined {
    if (!fs.existsSync(path)) return
    const stat = fs.statSync(path)
    return stat.size
}

export function getBasename(filename: string) {
    return path.basename(filename)
}

export function getFileExtension(filename: string) {
    return path.extname(filename)
}

export function getFiles(path: string) {
    if (!isDirectory(path)) {
        console.warn('GmJs getFiles warn: path is not a directory')
        return []
    }
    return fs.readdirSync(path)
}

export function getFilesR(path: string) {
    if (!isDirectory(path)) {
        console.warn('GmJs getFiles warn: path is not a directory')
        return []
    }
    return filesR(path, () => true, { ignores: [], maxDepth: 10 })
}

export function getFilesFull(path: string) {
    if (!isDirectory(path)) {
        console.warn('GmJs getFilesFull warn: path is not a directory')
        return []
    }
    return fs.readdirSync(path).map(el => path + '/' + el)
}

export function getFilesInfo(path: string) {
    if (!isDirectory(path)) {
        console.warn('GmJs getFilseInfo warn: path is not a directory')
        return []
    }
    const files = getFilesFull(path)
    return files.map(file => {
        const stat = fs.statSync(file)
        return { path: file, basename: getBasename(file), ext: getFileExtension(file), isDir: stat.isDirectory(), ...stat }
    })
}

export function getDirs(path: string) {
    if (!isDirectory(path)) {
        console.warn('GmJs getDirs warn: path is not a directory')
        return []
    }
    return onlyDirs(getFilesFull(path)).map(getBasename)
}

export function getDirsFull(path: string) {
    if (!isDirectory(path)) {
        console.warn('GmJs getDirsFull warn: path is not a directory')
        return []
    }
    return onlyDirs(getFilesFull(path))
}

export function isDirectory(path: string) {
    if (!fs.existsSync(path)) return
    return fs.lstatSync(path).isDirectory()
}

export function isFile(path: string) {
    if (!fs.existsSync(path)) return
    return !fs.lstatSync(path).isDirectory()
}

export function isFileExtension(path: string, ext: string) {
    if (!fs.existsSync(path)) return
    return getFileExtension(path) === ext || getFileExtension(path) === '.' + ext
}

export function onlyDirs(files: string[]) {
    return files.filter(isDirectory)
}

export function onlyFiles(files: string[]) {
    return files.filter(isFile)
}

export function onlyExtension(files: string[], ext: string) {
    return files.filter(file => isFileExtension(file, ext))
}

// [ 'E:/', 'E:/asdasd' ]
export function parentDirectories(filename: string): string[] | undefined {
    const res = [] as string[]
    let currentPath = filename
    let i = 0
    while (currentPath && i < 256) {
        if (currentPath !== path.dirname(currentPath)) {
            currentPath = path.dirname(currentPath)
            res.push(currentPath)
        } else {
            return res.reverse()
        }
        i++
    }
}

export function parentDir(filename: string) {
    return getBasename(path.dirname(filename))
}

export function parentDirectory(filename: string, ...others: any[]) {
    if (others) {
        const all = [filename, ...others]
        const parents = all.map(parentDirectories)
        return transpose(shrinkRight(parents as any)).filter(el => el.every(_el => _el === el[0])).reverse()[0][0]
    } else {
        return path.dirname(filename)
    }
}

export function isParentDirectory(dir: string, filename: string): boolean {
    return parentDirectory(filename) === dir
}

export function isParentDirectoryR(dir: string, filename: string): boolean {
    return !!parentDirectories(filename)?.includes(dir)
}

export const existFile = fs?.existsSync
export const createDirectory = fs?.mkdirSync
export const createDirectoryR = mkdirp?.sync
// Timers
export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export const gmTimeout = function(func: any, time: number[], enfunc: any) {
    return time.forEach(function(item, i, arr) {
        setTimeout(func, item)
        if (i === time.length - 1) {
            return setTimeout(enfunc, item)
        }
    })
}

export const $delay = function(ms: number, func: any) {
    return setTimeout(func, ms)
}

export const $interval = function(ms: number, func: any, timeout?: number) {
    if (timeout) {
        return intervalWithTimeout(timeout, ms, func)
    } else {
        return setInterval(func, ms)
    }
}

export const $int10 = (f: (...els: any) => any) => $interval(10, f)
export const $int20 = (f: (...els: any) => any) => $interval(20, f)
export const $int50 = (f: (...els: any) => any) => $interval(50, f)
export const $int100 = (f: (...els: any) => any) => $interval(100, f)
export const $int200 = (f: (...els: any) => any) => $interval(200, f)
export const $int500 = (f: (...els: any) => any) => $interval(500, f)
export const $int1000 = (f: (...els: any) => any) => $interval(1000, f)
export const $int2000 = (f: (...els: any) => any) => $interval(2000, f)
export const $int5000 = (f: (...els: any) => any) => $interval(5000, f)

export const $delay10 = (f: (...els: any) => any) => $delay(10, f)
export const $delay20 = (f: (...els: any) => any) => $delay(20, f)
export const $delay50 = (f: (...els: any) => any) => $delay(50, f)
export const $delay100 = (f: (...els: any) => any) => $delay(100, f)
export const $delay200 = (f: (...els: any) => any) => $delay(200, f)
export const $delay500 = (f: (...els: any) => any) => $delay(500, f)
export const $delay750 = (f: (...els: any) => any) => $delay(750, f)
export const $delay1000 = (f: (...els: any) => any) => $delay(1000, f)
export const $delay1500 = (f: (...els: any) => any) => $delay(1500, f)
export const $delay2000 = (f: (...els: any) => any) => $delay(2000, f)
export const $delay5000 = (f: (...els: any) => any) => $delay(5000, f)

export const gmDelaySolid = function(t: number, f: any) {
    const _timestump = $time()
    return setTimeout(function(ts) {
        if (_timestump === ts) {
            return f()
        }
    }, t, _timestump)
}

export const intervalWithTimeout = (f: any, interval: number, timeout: number) => {
    const id = $interval(interval, () => f() ? clearInterval(id) : null)
    return $delay(timeout, () => clearInterval(id))
}

export const $time = function() {
    return (new Date()).getTime()
}

export const second = 1000
export const K = 1000
export const minute = 60 * 1000
export const hour = 60 * 60 * 1000
export const day = 86400 * 1000
export const week = 7 * day
export const month = 30 * day
export const year = 365 * day

export function dirname(meta?: string) {
    if (meta) {
        const moduleURL = new URL(meta)
        return path.dirname(moduleURL.pathname).replace('/E:', 'E:')
    } else {
        return path.resolve()
    }
}

export const args = () => process.argv

export function convertToArgs(args: any) {
    return Array.isArray(args) ? args.join(' ') : args
}

export function callSync(cmd: string, args: any) {
    const proc = spawnSync(cmd, args)
    // console.log(proc);
    return proc.output.toString()
}

export const run = spawn
export const runSync = callSync

export function pyExec(path: string, args: any) {
    const _args = convertToArgs(args)
    console.log(`python ${path} ${_args}`)
    return exec(`python ${path} ${_args}`)
}

export function py3Exec(path: string, args: any) {
    const _args = convertToArgs(args)
    console.log(`python ${path} ${_args}`)
    return exec(`python ${path} ${_args}`)
}

export function callPySync(path: string, args?: any) {
    const proc = spawnSync('python', args ? [path, ...args] : [path])
    // console.log(proc);
    return proc.output.toString()
}

export function callPy3Sync(path: string, args?: any) {
    const proc = spawnSync('py', args ? [path, ...args] : [path])
    return proc.output.toString()
}
export function openFile(path: string) {
    return exec(`start "" "${path}"`)
}

export function runFile(path: string) {
    const parent = parentDirectory(path)
    return exec(`start "" /d "${parent}" "${path}"`)
}

export function openFileOrCreate(path: string) {
    if (!existFile(path)) {
        writeFile(path, '')
    }
    return exec(`start "" "${path}"`)
}

export function openFileOrCreateR(path: string) {
    if (!existFile(path)) {
        const dir = parentDir(path)
        if (!existFile(dir)) {
            createDirectoryR(dir)
        }
        writeFile(path, '')
    }
    return exec(`start "" "${path}"`)
}
// Computed consts
export const appDataDir = process.env.APPDATA && path?.dirname(process.env.APPDATA)

export function escapeHtml(unsafe: string) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}
