<template>
    <div class="app">
        <div class="header"></div>
        <div class="main flex flex-col items-start px-4 mt-4">
            <InputApiKey />
            <div class="flex items-center mb-4">
                <InputText
                    v-model:value="dir"
                    placeholder="C:/Projects/sample-app/src"
                    :error="!dir || !existFile(dir)"
                    label="Project directory"
                    @update:value="updateFiles"  />
                <button @click="selectFolder" class="btn-select bg-gray-100 mt-6" ><IconFolder/></button>
                <button v-if="dir" @click="openFile(dir)" class="p-1 bg-gray-100 mt-6 text-sm ml-2">Open in Explorer</button>
                <button v-if="dir" @click="openVSC(dir)" class="p-1 bg-gray-100 mt-6 text-sm ml-2">VSC</button> 
            </div>
            <Config
                :config="config"
                :configFile="configFile"
                @delConfig="() => (configFile = '', config = null)"
                @loadConfig="loadConfig"
                @saveConfig="saveConfig"
                :configChanged="configChanged" />
            <Settings
                class="mt-2 mb-2 w-1/2"
                :defaultConfig="localStorageConfig"
                :config="config"
                @update:value="val => updateSettings(val)" />
            <div class="tabs w-full text-lg flex text-center mt-4 mb-4">
                <div class="tab w-1/2 cursor-pointer py-2 text-lg" :class="{active: tab === 'docs' || !tab}" @click="() => (tab = '', ls('tab', ''))">Documentation</div>
                <div class="tab w-1/2 cursor-pointer py-2 text-lg" :class="{active: tab === 'insight'}" @click="() => (tab = 'insight', ls('tab', 'insight'))">Insight</div>
            </div>
            <TabDocs
                ref="tabDocs"
                v-show="!tab || tab === 'docs' "
                :files="files"
                :dir="dir"
                @updateSettings="val => updateSettings(val)"
                :config="currentConfig"
                :prevResult="prevResult"
            />
            <TabInsight
                v-if="tab === 'insight'"
                ref="tabInsight"
                :documentation="insightDocumentation"
                :config="currentConfig"
                :dir="dir"
                :key="dir"
            />
        </div>
        <TheFooter class="w-full" />
    </div>
</template>

<script lang="ts">
        import {debounce, size, includes} from 'lodash'
    import { defineComponent } from 'vue'
    import InputText from './components/misc/InputText.vue'
    import ls from 'local-storage'
    import Files from '@/components/Files.vue'
    import { IFile } from '@/../types'
    import { existFile, getFileDate, readFileJSON, run, dirname, total, openFile, writeFileJSON, isPythonInstalled, callPySync } from '@/../helpers/node_gm'
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
    import TabDocs from '@/components/TabDocs.vue'
    import TabInsight from '@/components/TabInsight.vue'

    export const resFile = path.resolve(dirname(), "./docs.ai.json")

    export default defineComponent({
        name: 'App',
        components: {
            TabInsight,
            TabDocs,
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
                existFile,
                tab: (ls as any)("tab") || "",
                prevResult: [] as IFile[],
                configChanged: false,
                configFile: "",
                config: null,
                localStorageConfig: (ls as any)("localStorageConfig") || {},
                total,
                openFile,
                generator: null as DocumentationGenerator | null,
                filesArr: [] as IFile[],
                maxQueries: +ls("maxQueries") as unknown as number || 6,
                res: null,
                files: [] as IFile[],
                dir: ls("dir") as unknown as string || '',
                ls,
            }
        },
        computed: {
            insightDocumentation(): IFile[] {
                const res = this.$refs?.tabDocs?.done ? this.$refs?.tabDocs?.mergedFiles : (this.prevResult.length ? this.prevResult : this.files)
                return [...res, ...this.files.filter((file) => res.map((re) => re.path).includes(file.path) === false)]
            },

            currentConfig() {
                return {
                    ...this.localStorageConfig,
                    ...this.config,
                }
            },
        },
        methods: {
            openVSC(dir: string) {
                const { exec } = require('child_process')
                exec(`code ${dir}`)
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

            selectFolder() {
                remote.dialog.showOpenDialog({
                    properties: ['openDirectory'],
                }).then(result => {
                    if (!result.canceled && result.filePaths.length > 0) {
                        console.log("selectFolder")
                        this.dir = result.filePaths[0]
                        this.updateFilesSync(this.dir)
                        if (this.$refs.tabDocs) {
                            this.$refs.tabDocs.saved = false
                        }
                    }
                }).catch(err => {
                    console.log(err)
                })
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
            }, 300),
        },

        created () {
            this.dir && this.updateFilesSync(this.dir)
        },

        watch: {

        },
    })
</script>

<style lang="scss" scoped>
    .tab{
        background-color: rgb(241, 246, 248);
        &.active, &:hover {
            border-bottom: 2px solid #204eb2;
            background-color: rgb(219, 235, 240);
        }
    }
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
        background: white;
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
