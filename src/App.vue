<template>
    <div class="app">
        <div class="header"></div>
        <div class="main flex flex-col items-start px-4 mt-4">
            <InputText class="mb-2" v-model:value="apiKey" label="API Key" @update:value="val => ls('apiKey', val)"  />
            <div class="flex items-center mb-4">
                <InputText v-model:value="dir" label="Project directory" @update:value="updateFiles"  />
                <button @click="selectFolder" class="btn-select bg-gray-100 mt-6" ><IconFolder/></button>
                <button v-if="dir" @click="openFile(dir)" class="p-1 bg-gray-100 mt-6 text-sm ml-2">Open in Explorer</button>
            </div>
            <InputText class="mb-2 max-queries" v-model:value="maxQueries" label="Maximum number of requests simultaneously" @update:value="val => ls('maxQueries', val)"  />
            <div class="description text-sm">
                <div>
                    Count of requests: {{ $refs.files?.selectedFiles?.length }}
                </div>
                <!-- <div v-if="$refs.files?.selectedFiles">
                    Approximate tokens count: {{ cost }}$
                </div> -->
            </div>
            <div class="flex items-center">
                <button class="px-4 py-1 rounded mb-2" :class="isLoading? 'bg-red-500 text-white' : 'bg-green-300'"  @click="run">
                    <b>{{isLoading ? 'Stop' : 'Run'}}</b>
                </button>
                <button v-if="done" class="px-4 py-1 rounded mb-2 bg-blue-300 ml-2" @click="save()" >Save docs.ai.json</button>
                <button v-if="done" class="px-4 py-1 rounded mb-2 bg-blue-300 ml-2" @click="saveAs()">Save As...</button>
                <span v-if="saved" class="text-green-400 ml-2" >Saved!</span>
            </div>
            <Files :files="files" ref="files" class="mt-4" />
            <!-- <Result :res="res" /> -->
        </div>
        <div class="footer flex items-center mt-6 px-2 py-1">
            <button class="p-1 bg-gray-200 mr-2 rounded" @click="reload">Reload</button>
            <button class="p-1 bg-gray-200 mr-2 rounded" @click="openLink('https://platform.openai.com/account/usage')">OpenAI Page</button>
            <button class="p-1 bg-gray-200 mr-2 rounded" @click="openLink('https://github.com/Kypaku/gpt-files-documentation')">Repo</button>
            <button class="p-1 bg-gray-200 mr-2 rounded" @click="clearCache">Clear Cache</button>
        </div>
    </div>
</template>

<script lang="ts">
        import {debounce, size} from 'lodash'
    import { defineComponent } from 'vue'
    import InputText from './components/misc/InputText.vue'
    import ls from 'local-storage'
    import Files from '@/components/Files.vue'
    import { IFile } from '@/../types'
    import { existFile, getFileDate, readFileJSON, run, dirname, total, openFile, writeFileJSON } from '@/../helpers/node_gm'
    import path from 'path'
    import Result from '@/components/Result.vue'
    import { getFilesInDirectory } from '@/../helpers'
    import { DocumentationGenerator } from '@/../engine'
    import IconFolder from './components/misc/IconFolder.vue'
    import { remote, shell } from 'electron'

    const resFile = path.resolve(dirname(), "./docs.ai.json")
    const selectedFile = path.resolve(dirname(), "./data/selectedFiles.json")

    export const maxTokens = 4097
    export const bytesPerToken = 4

    export default defineComponent({
        name: 'App',
        components: {
            IconFolder,
            Result,
            Files,
            InputText,
        },
        data() {
            return {
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
                apiKey: ls("apiKey") as unknown as string || '',
                ls,
            }
        },
        computed: {
            // cost(): number {
            //     const tokensFilesSend = total(this.$refs.files?.selectedFiles?.map((selectedFile) => selectedFile.size || 0)) / bytesPerToken
            // },

        },
        methods: {
            openLink(path: string) {
                shell.openExternal(path.replaceAll('&amp;', '&'))
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
                    writeFileJSON(result.filePath, this.$refs.files.selectedFiles)
                    console.log("saveAs", { resFile })
                    this.saved = true
                }).catch(err => {
                    console.error(err)
                })
            },

            save() {
                this.saved = false
                writeFileJSON(path.resolve(this.dir, "./docs.ai.json"), this.$refs.files.selectedFiles.map((selectedFile) => ({path: selectedFile.path, description: selectedFile.description, size: selectedFile.size})))
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

                        // do something with the selected folder
                    }
                }).catch(err => {
                    console.log(err)
                })
            },

            clearCache() {
                ls("dir", "")
                ls("apiKey", "")
                ls("excludes", "")
                ls("maxQueries", "")
            },

            reload() {
                location.reload()
            },

            async run() {
                try {
                    if (this.isLoading) {
                        this.generator.stop()
                        this.isLoading = false
                        this.done = true
                    } else {
                        this.saved = false
                        this.isLoading = true
                        this.updateFilesSync(this.dir)
                        const options = {
                            apiKey: this.apiKey,
                            maxQueries: this.maxQueries,
                        }
                        this.filesArr = [...this.$refs.files.selectedFiles]
                        this.generator = new DocumentationGenerator(this.filesArr, options)
                        this.res = await this.generator.start()
                        this.isLoading = false
                        this.done = true
                    }
                } catch (e) {
                    console.error("catch", { e })
                } finally {
                    this.isLoading = false
                }
            },
            updateFilesSync(dir) {
                ls("dir", dir)
                if (existFile(dir)) {
                    this.files = getFilesInDirectory(dir, dir)
                }
            },
            updateFiles: debounce(function(dir) {
                ls("dir", dir)
                if (existFile(dir)) {
                    this.files = getFilesInDirectory(dir, dir)
                }
            }, 200),
        },

        created () {
            this.updateFiles(this.dir)
        },

        watch: {
            filesArr: {
                handler (newVal) {
                    this.files = newVal
                },
                deep: true,
            },

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
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2c3e50;
    }
</style>
