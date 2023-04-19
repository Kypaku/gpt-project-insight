<template>
    <div class="tab-docs w-full">
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
            @updateExcludes="val => $emit('updateSettings', { excludes: val })"
            :defaultConfig="localStorageConfig"
            :prevResult="prevResult"
            :isUpdateLoading="isUpdateLoading"
            :config="config"/>
    </div>
</template>

<script lang='ts'>
    import { defineComponent, PropType } from 'vue'
    import Files from './Files.vue'
    import { IFile } from '@/../types'
    import { DocumentationGenerator, DocumentationGeneratorOptions } from '@/../engine'
    import { exclude, getParentFolders, getUpdatedParentFolders } from '@/../helpers'
    import { getFileDate, isDirectory, writeFileJSON } from '@/../helpers/node_gm'
    import path from 'path'
    import { remote } from 'electron'
    import {resFile} from '../App.vue' 
    import ls from 'local-storage' 

    export const maxTokens = 4097
    export const bytesPerToken = 4

    export default defineComponent({
        props: {
            prevResult: {
                type: Array as PropType<IFile[]>,
                default: () => []
            },
            localStorageConfig: {
                type: Object as PropType<DocumentationGeneratorOptions>,
                default: () => null
            },
            config: {
                type: Object as PropType<DocumentationGeneratorOptions>,
                default: () => null
            },
            dir: {
                type: String,
                default: () => ""
            },
            files: {
                type: Array as PropType<IFile[]>,
                default: () => []
            },

        },
        components: {
            Files
        },
        data() {
            return {
                filesI: 0,
                isUpdateLoading: false,
                isLoading: false,
                done: false,
                saved: false,

            }
        },
        computed: {
            excludes(): string {
                return this.currentConfig?.excludes || ''
            },
            currentConfig() {
                return {
                    ...this.localStorageConfig,
                    ...this.config,
                }
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
        },
    })

    </script>

<style lang="scss" scoped>

</style>
