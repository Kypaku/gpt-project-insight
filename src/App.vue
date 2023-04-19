<template>
    <div class="app">
        <div class="header"></div>
        <div class="main flex flex-col items-start px-4 mt-4">
            <InputApiKey />
            <div class="flex items-center mb-4">
                <InputText v-model:value="dir" placeholder="C:/Projects/sample-app/src" label="Project directory" @update:value="updateFiles"  />
                <button @click="selectFolder" class="btn-select bg-gray-100 mt-6" ><IconFolder/></button>
                <button v-if="dir" @click="openFile(dir)" class="p-1 bg-gray-100 mt-6 text-sm ml-2">Open in Explorer</button>
            </div>
            <Config
                :config="config"
                :configFile="configFile"
                @delConfig="() => (configFile = '', config = null)"
                @loadConfig="loadConfig"
                @saveConfig="saveConfig"
                :configChanged="configChanged" />
            <Settings
                class="mt-2 mb-2"
                :defaultConfig="localStorageConfig"
                :config="config"
                @update:value="val => updateSettings(val)" />
            <div class="description text-sm">
                <div>
                    Count of requests: {{selectedFiles.length }}
                </div>
                <!-- <div v-if="">
                    Approximate tokens count: {{ cost }}$
                </div> -->
            </div>
            <div class="flex items-center">
                <button
                    title="Generate documentation for all the following files"
                    class="px-4 py-1 rounded mb-2"
                    :disabled="isUpdateLoading"
                    :class="isLoading ? 'bg-red-500 text-white' : 'bg-green-300'"
                    @click="run(false)">
                    <b>{{isLoading ? 'Stop' : 'Generate'}}</b>
                </button>
                <button
                    title="Generate documentation for only files that have been changed since the last generation"
                    v-if="mergedFiles.find((selectedFile) => selectedFile.state !== 'done') && mergedFiles.filter((selectedFile) => selectedFile.state !== 'done').length !== mergedFiles.length"
                    class="px-4 py-1 ml-2 rounded mb-2"
                    :disabled="isLoading"
                    :class="isUpdateLoading? 'bg-red-500 text-white' : 'bg-yellow-300'"
                    @click="() => run(true)">
                    <b>{{isUpdateLoading ? 'Stop' : 'Update'}}</b>
                </button>
                <button v-if="done" class="px-4 py-1 rounded mb-2 bg-indigo-300 ml-2" @click="save(dir + '/docs.ai.json')" >Save docs.ai.json</button>
                <button v-if="done" class="px-4 py-1 rounded mb-2 bg-indigo-300 ml-2" @click="saveAs()">Save As...</button>
                <span v-if="saved" class="text-green-400 ml-2" >Saved!</span>
            </div>
            <Files
                :key="'files_' + filesI"
                :dir="dir"
                :files="mergedFiles"
                ref="files"
                class="mt-4"
                @updateExcludes="val => (updateSettings({ excludes: val }))"
                :defaultConfig="localStorageConfig"
                :prevResult="prevResult"
                :isUpdateLoading="isUpdateLoading"
                :config="config"/>
        </div>
        <TheFooter/>
    </div>
</template>

<script lang="ts">
    import { debounce, size } from 'lodash'
    import { defineComponent } from 'vue'
    import InputText from './components/misc/InputText.vue'
    import ls from 'local-storage'
    import Files from '@/components/Files.vue'
    import { IFile } from '@/../types'
    import { existFile, getFileDate, readFileJSON, run, dirname, total, openFile, writeFileJSON, isDirectory } from '@/../helpers/node_gm'
    import path from 'path'
    import Result from '@/components/Result.vue'
    import { exclude, getFilesInDirectory, getParentFolders, getUpdatedParentFolders } from '@/../helpers'
    import { DocumentationGenerator, DocumentationGeneratorOptions } from '@/../engine'
    import IconFolder from './components/misc/IconFolder.vue'
    import { remote, shell } from 'electron'
    import Settings from '@/components/Settings.vue'
    import TheFooter from '@/components/TheFooter.vue'
    import Config from '@/components/Config.vue'
    import InputApiKey from '@/components/misc/InputApiKey.vue'

    const resFile = path.resolve(dirname(), "./docs.ai.json")

    export const maxTokens = 4097
    export const bytesPerToken = 4

    export default defineComponent({
        name: 'App',
        components: {
            InputApiKey,
            Config,
            TheFooter,
            Settings,
            IconFolder,
            Result,
            Files,
            InputText,
        },
        data() {
            return {
                filesI: 0,
                isUpdateLoading: false,
                prevResult: [] as IFile[],
                configChanged: false,
                configFile: "",
                config: null,
                localStorageConfig: (ls as any)("localStorageConfig") || {},
                saved: false,
                done: false,
                total,
                openFile,
                generator: null as DocumentationGenerator | null,
                filesArr: [] as IFile[],
                maxQueries: +ls("maxQueries") as unknown as number || 6,
                res: null,
                isLoading: false,
                files: [] as IFile[],
                dir: ls("dir") as unknown as string || '',
                ls,
            }
        },
        computed: {
            currentConfig() {
                return {
                    ...this.localStorageConfig,
                    ...this.config,
                }
            },
            excludes(): string {
                return this.currentConfig?.excludes || ''
            },

            // cost(): number {
            //     const tokensFilesSend = total(this.$refs.files?.selectedFiles?.map((selectedFile) => selectedFile.size || 0)) / bytesPerToken
            // },
            excludedFiles(): IFile[] {
                return exclude(this.files, this.excludes, { maxTokens, bytesPerToken, maxTokensFile: this.currentConfig.maxTokensFile })
            },
            prevResultDate(): number {
                return +(getFileDate(this.dir + "/docs.ai.json") || 0)
            },
            needToUpdateFiles(): IFile[] {
                return this.excludedFiles.filter(file => {
                    return this.isFileNeedUpdate(file)
                })
            },
            parentFolders(): string[] {
                const selectedPaths = this.excludedFiles.map(file => file.path)
                const parentFolders = getParentFolders(selectedPaths)
                    .filter((pathOne) => !selectedPaths.includes(pathOne))
                return parentFolders
            },
            updatedParentFolders(): string[] {
                const undoneFiles = this.needToUpdateFiles.map((file) => file.path)
                const prevParentFolders = getUpdatedParentFolders(undoneFiles, this.prevResult.map((file) => file.path))
                return prevParentFolders
            },
            selectedFiles(): IFile[] {
                const selected: IFile[] = [...this.excludedFiles]
                if (this.prevResult.length) {
                    selected.push(...this.parentFolders.map(folder => ({ path: folder, fullPath: path.resolve(this.dir, folder) })))
                    console.log("selectedFiles", this.updatedParentFolders)
                } else {
                    selected.push(...this.parentFolders.map(folder => ({ path: folder, fullPath: path.resolve(this.dir, folder) })))
                }
                return selected
            },
            mergedFiles(): IFile[] {
                if (this.prevResult.length) {
                    if (true) { //! this.done! this.isUpdateLoading && !this.isLoading &&
                        return this.selectedFiles.map((file) => {
                            const prevFile = this.prevResult.find((prevFile) => prevFile.path === file.path)
                            let needToUpdate = this.isFileNeedUpdate(file)
                            if (isDirectory(file.fullPath)) {
                                needToUpdate = this.updatedParentFolders.includes(file.path)
                            }
                            return {
                                ...file,
                                state: needToUpdate ? undefined : "done",
                                description: (prevFile !== undefined && !needToUpdate) ? prevFile?.description : file.description,
                            }
                        })
                    } else {
                        return this.selectedFiles
                    }
                } else {
                    return this.selectedFiles
                }
            }
        },
        methods: {
            isFileNeedUpdate(file: IFile): boolean {
                const prevFile = this.prevResult.find((prevFile) => prevFile.path === file.path)
                const dateCond = (file.fullPath && !isDirectory(file.fullPath) && +(getFileDate(file?.fullPath) || 0) > this.prevResultDate)
                const needToUpdate = !prevFile || !prevFile.description || dateCond
                return needToUpdate
            },
            saveConfig() {
                if (!this.config) {
                    const configFile = this.dir + "/docs.ai.config.json"
                    writeFileJSON(configFile, this.localStorageConfig)
                    return
                }
                writeFileJSON(this.configFile, this.config)
                this.configChanged = false
            },

            loadConfigRaw(_path: string) {
                this.configFile = _path
                this.config = readFileJSON(this.configFile)
                this.configChanged = false
            },

            loadConfig() {
                const options = {
                    defaultPath: path.resolve(this.dir),
                    filters: [{ name: 'JSON', extensions: ['json'] }]
                }
                remote.dialog.showOpenDialog(options).then(result => {
                    if (result.canceled) {
                        return
                    }
                    this.loadConfigRaw(result.filePaths[0])
                    console.log("loadConfig", { resFile })
                }).catch(err => {
                    console.error(err)
                })
            },

            updateSettings(val: DocumentationGeneratorOptions) {
                if (this.config) {
                    this.config = { ...this.config, ...val }
                    this.configChanged = true
                } else {
                    this.localStorageConfig = { ...this.localStorageConfig, ...val }
                    ls('localStorageConfig', val)
                }
            },

            saveAs() {
                const options = {
                    defaultPath: path.resolve(this.dir, "./docs.ai.json"),
                    filters: [{ name: 'JSON', extensions: ['json'] }]
                }
                remote.dialog.showSaveDialog(options).then(result => {
                    if (result.canceled) {
                        return
                    }
                    this.save(result.filePath)
                    this.saved = true
                }).catch(err => {
                    console.error(err)
                })
            },

            save(file: string) {
                this.saved = false
                const res = this.mergedFiles.map((selectedFile) => ({ path: selectedFile.path, description: selectedFile.description, size: selectedFile.size }))
                writeFileJSON(file, res)
                console.log("save", { resFile })
                this.saved = true
            },

            selectFolder() {
                remote.dialog.showOpenDialog({
                    properties: ['openDirectory'],
                }).then(result => {
                    if (!result.canceled && result.filePaths.length > 0) {
                        this.dir = result.filePaths[0]
                        this.updateFilesSync(this.dir)
                        this.saved = false
                    }
                }).catch(err => {
                    console.log(err)
                })
            },
            setLoading(value: boolean, isUpdate?: boolean) {
                if (isUpdate) {
                    this.isUpdateLoading = value
                } else {
                    this.isLoading = value
                }
            },
            async run(isUpdate?: boolean) {
                let intervalId: any = null
                try {
                    if (isUpdate ? this.isUpdateLoading : this.isLoading) {
                        this.generator.stop()
                        this.setLoading(false, isUpdate)
                        this.done = true
                    } else {
                        this.saved = false
                        this.setLoading(true, isUpdate)
                        // this.updateFilesSync(this.dir)
                        const options = {
                            apiKey: (ls as any)("apiKey"),
                            maxQueries: this.maxQueries,
                        }
                        // this.filesArr = [...this.mergedFiles]
                        const filesArr = [...this.mergedFiles]
                        filesArr.forEach((filesArrOne) => {
                            if (isUpdate) {
                                if (filesArrOne.state !== 'done') {
                                    delete filesArrOne.description
                                }
                            } else {
                                delete filesArrOne.description
                                filesArrOne.state = undefined
                            }
                        })
                        this.generator = new DocumentationGenerator(filesArr, options)
                        intervalId = setInterval(() => {
                            this.filesI++
                        }, 250)
                        this.res = await this.generator.start()
                        this.setLoading(false, isUpdate)
                        this.done = true
                    }
                } catch (e) {
                    console.error("catch", { e })
                } finally {
                    this.setLoading(false, isUpdate)
                    this.filesI++
                    clearInterval(intervalId)
                }
            },
            updateFilesSync(dir) {
                ls("dir", dir)
                if (existFile(dir)) {
                    this.files = getFilesInDirectory(dir, dir)
                }
                if (existFile(dir + "/docs.ai.config.json")) {
                    this.loadConfigRaw(dir + "/docs.ai.config.json")
                }
                if (existFile(dir + "/docs.ai.json")) {
                    this.prevResult = readFileJSON(dir + "/docs.ai.json").filter((prevResultFileOne) => prevResultFileOne.description)
                }
            },
            updateFiles: debounce(function(dir) {
                this.updateFilesSync(dir)
            }, 200),
        },

        created () {
            this.updateFiles(this.dir)
        },

        watch: {

        },
    })
</script>

<style lang="scss" scoped>
    .btn-select{
        padding: 7px;
    }

</style>

<style lang="scss">
    .max-queries input{
        max-width: 100px;
    }
    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        color: #2c3e50;
    }
    .flex-center{
        display: flex;
        align-items: center;
    }
    .flex-center-between{
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
</style>
