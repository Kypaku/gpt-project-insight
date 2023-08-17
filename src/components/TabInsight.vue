<template>
    <div class="tab-insight w-full">
        <SavedResults :dir="dir" @select="item => loadResultByName(item)"/>
        <ProjectsList/>
        <Examples @apply="val => (prompt = val)" />
        <b>Prompt</b>
        <InputTextarea v-model:value="prompt" class="w-full" :rows="3"/>
        <button @click="setToDefault" class="underline text-sm" >Set to default</button>
        <ToggleSwitch class="mt-2" v-model:value="includeFiles" :label="`Include files (+${lengthToTokensCount(filesStr.length)} tokens)`" />
        <ToggleSwitch
            class="mt-2"
            v-model:value="includeDescription"
            :label="`Include description (+${descriptionSize} tokens)`"
            @update:value="val => updateFilesStr('description', val)" />
        <ToggleSwitch class="mt-2" v-model:value="includeContent" :label="`Include content (+${lengthToTokensCount(contentStr.length)} tokens)`" />
        <ToggleSwitch class="mt-2" v-model:value="showCycles" :label="`Show cycles`" />
        <FilesInsight v-model:value="filesStr" v-if="includeFiles" @toggleDescription="({file, value}) => updateFilesStr('description', value, file)"/>
        <ContentInsight
            v-model:value="contentStr"
            v-if="includeContent"
            :documentation="documentation"
            :dir="dir"/>
        <Info :promptSize="promptSize" :maxTokens="maxTokens"  />
        <!-- :price="price" -->
        <Warning
            class="mt-2"
            :value="'To include descriptions in the prompt, you need to generate documentation.'"
            v-if="!descriptionSize" />
        <Cycles :files="files" v-if="showCycles" :config="config"/>
        <button @click="showRawPrompt = !showRawPrompt" class="underline text-sm"> {{ showRawPrompt ? 'Hide' : 'Show'  }} raw prompt</button>
        <InputTextarea
            v-if="showRawPrompt"
            v-model:value="rawPrompt"
            class="mt-2 w-full"
            :rows="10"
        />
        <div class="buttons mt-2">
            <button
                class="px-2 py-1 rounded btn-run-files mb-2 mr-2"
                :disabled="isFilesLoading || isLoading"
                :class="isFilesLoading ? 'opacity-50' : ''"
                @click="askInsight('files')">
                Ask for files
                <!-- {{isFilesLoading ? 'Stop' : 'Ask for files'}} -->
            </button>
            <button
                class="px-4 py-1 rounded mb-2 mr-2 btn-run"
                :disabled="isFilesLoading"
                @click="askInsight('content')">
                <b>{{isLoading ? 'Stop' : 'Run'}} <span v-show="loadingTime" class="font-normal" >
                    ({{ loadingTime.toFixed(1) }}s)</span>
                </b>
            </button>
            <button
                v-if="result"
                class="px-2 py-1 rounded btn-save-result mb-2 mr-2 bg-blue-400"
                :disabled="!result"
                @click="saveResult()">
                Save Result
            </button>
            <button
                v-if="!result"
                class="px-2 py-1 rounded btn-save-result mb-2 mr-2 bg-blue-400"
                @click="loadResultDialog()">
                Load Result
            </button>
        </div>
        <Warning
            class="mt-2"
            v-if="resultSaved"
            @click="clearSaveMessageTimeout()">
            The result saved in the file: <span class="underline cursor-pointer" @click="copy(resultSaved)" >{{resultSaved}}</span>
        </Warning>
        <Error :value="error" v-if="error" class="mt-2"  />
        <Warning
            class="mt-2"
            :value="'If you have not enough tokens for the prompt you need to increase \'Max Tokens Shift\' in the settings.'"
            v-if="notEnoughTokens" />

        <ResultFiles
            class="result mt-2"
            ref="resultFilesRef"
            :content="resultFiles"
            v-if="resultFiles"
            :files="files"
            :filesStr="filesStr"
            :documentation="documentation"
            :contentStr="contentStr"
            @updateFilesStr="({field, file}) => updateFilesStr(field, true, file)"
            @addFileContent="file => addFileToContentStr(file)"
        />
        <Result
            ref="resultRef"
            :content="result"
            v-if="result"
            class="mt-2"
            :files="files"
            :dir="dir"
            @update:value="val => updateResult(val)"
        />
    </div>
</template>

<script lang='ts'>
    import { ROOT_DIR } from './../helpers'
    import { defineComponent, PropType } from 'vue'

    import InputTextarea from './misc/InputTextarea.vue'
    import { Insight } from '@/../engine/insight'
    import ls from 'local-storage'
    import { bytesPerToken, maxTokens } from '@/components/TabDocs.vue'
    import ToggleSwitch from '@/components/misc/ToggleSwitch.vue'
    import Accordeon from './misc/Accordeon.vue'
    import { IFile } from 'types'
    import Error from './misc/Error.vue'
    import Warning from './misc/Warning.vue'
    import { copy, lengthToTokensCount } from '@/../helpers'
    import { DocumentationGeneratorOptions } from 'engine'
    import ResultFiles from '@/components/insight/ResultFiles.vue'
    import { readFile, readFileJSON, writeFileJSON } from '@/../helpers/node_gm'
    import Result from '@/components/insight/Result.vue'
    import FilesInsight from '@/components/insight/FilesInsight.vue'
    import ContentInsight from '@/components/insight/ContentInsight.vue'
    import path from 'path'
    import Examples from './Examples.vue'
    import { remote } from 'electron'
    import SavedResults, { IResult } from '@/components/insight/SavedResults.vue'
    import ProjectsList from './insight/ProjectsList.vue'
    import Cycles from './insight/Cycles.vue'
    import Info from './Info.vue'

    export const ENDOFFILE = ' ###ENDOF' + 'FILE###'

    export default defineComponent({
        props: {
            dir: {
                type: String,
                default: () => ''
            },
            documentation: {
                type: Array as PropType<IFile[]>,
                default: () => []
            },
            config: {
                type: Object as PropType<DocumentationGeneratorOptions>,
                default: () => null
            },
        },
        components: {
            Info,
            Cycles,
            ProjectsList,
            SavedResults,
            Examples,
            ContentInsight,
            FilesInsight,
            Result,
            ResultFiles,
            ToggleSwitch,
            InputTextarea,
            Accordeon,
            Error,
            Warning
        },
        data() {
            return {
                copy,
                showCycles: false,
                rawPrompt: "",
                showRawPrompt: false,
                saveMessageTimeout: null,
                resultSaved: '',
                loadingInterval: null,
                resultFiles: "",
                error: "",
                contentStr: "",
                includeContent: false,
                includeDescription: false,
                includeSize: false,
                filesStr: "",
                includeFiles: false,
                result: "",
                isLoading: false,
                isFilesLoading: false,
                prompt: "",
                insight: null as Insight | null,
                bytesPerToken,
                notEnoughTokens: false,
                lengthToTokensCount,
                loadingTime: 0,
            }
        },
        computed: {
            maxTokens(): number {
                return this.config?.maxTokensModel || maxTokens
            },

            files(): string[] {
                return this.documentation
            },

            promptSize(): number {
                // return lengthToTokensCount((this.prompt.length + (this.includeFiles ? this.filesStr.length : 0) + (this.includeContent ? this.contentStr.length : 0))) + this.getTokensShift()
                return lengthToTokensCount(this.rawPrompt.length) + this.getTokensShift()
            },
            sizeSize(): number {
                const sizeLength = this.filesStr.split("\n").map(f => {
                    const size = this.documentation.find(d => d.path === f.split(" ")[0])?.size
                    return (size ? " " + size + "bytes" : "")
                }).join("").length
                return lengthToTokensCount(sizeLength)
            },
            descriptionSize(): number {
                const descriptionLength = this.filesStr.split("\n").map(f => {
                    const description = this.documentation.find(d => d.path === f.split(" ")[0])?.description
                    return (description ? " Description: " + description : "")
                }).join("").length
                return lengthToTokensCount(descriptionLength)
            },
            combinedWatchers(): string {
                return this.prompt + this.filesStr + this.contentStr + this.includeFiles + this.includeContent
            },
        },
        methods: {
            updateResult(val: string) {
                this.result = val
            },

            includeFilesContent(files: string[]) {
                // edit contentStr
                // '\n' + item.path + ":\n" + readFile(path.resolve(this.dir, item.path)) + '\n' + ENDOFFILE
                this.contentStr = this.contentStr + files.map(f => '\n' + f + ":\n" + readFile(path.resolve(this.dir, f)) + '\n' + ENDOFFILE).join("")
            },
            updateTokensCount(rawPrompt: string) {

            },

            loadResultByName(item: IResult) {
                this.loadResult(path.resolve(ROOT_DIR, 'data', item.name))
            },

            updateRawPrompt() {
                const options = {
                    filesStr: this.includeFiles ? this.filesStr : undefined,
                    contentStr: this.includeContent ? this.contentStr : undefined,
                    ...this.config,
                    timeout: this.config.insightTimeout || 120000,
                }
                this.insight = new Insight([], options)
                this.rawPrompt = this.insight.generatePrompt(this.prompt, options)
            },
            clearSaveMessageTimeout() {
                clearTimeout(this.saveMessageTimeout)
            },

            loadResultDialog() {
                const file = remote.dialog.showOpenDialogSync({
                    properties: ['openFile'],
                    filters: [
                        { name: 'JSON', extensions: ['json'] },
                    ]
                })
                if (file) {
                    this.loadResult(file[0])
                }
            },

            saveResult() {
                const file = path.resolve(ROOT_DIR, 'data', `result_${+new Date()}.json`)
                writeFileJSON(file, {
                    dir: this.dir,
                    result: this.result,
                    prompt: this.rawPrompt,
                    filesStr: this.filesStr,
                    contentStr: this.contentStr,
                } as IResult)
                this.resultSaved = file
                this.saveMessageTimeout = setTimeout(() => {
                    this.resultSaved = ''
                }, 5000)
            },
            loadResult(file) {
                const data = readFileJSON(file)
                this.result = data.result
                setTimeout(() => {
                    this.scrollToResult()
                }, 0)
            },
            scrollToResult() {
                if (this.result) {
                    this.$refs.resultRef.$el.scrollIntoView({ behavior: 'smooth' })
                } else if (this.resultFiles) {
                    this.$refs.resultFilesRef.$el.scrollIntoView({ behavior: 'smooth' })
                }
            },
            setToDefault() {
                this.includeContent = false
                this.includeDescription = false
                this.includeSize = false
                this.includeFiles = true
                this.contentStr = ""
                this.filesStr = this.files.map((file) => file.path).join("\n")
                this.prompt = ""
                this.result = ""
                this.resultFiles = ""
                this.error = ""
            },

            addFileToContentStr(file) {
                if (!this.includeContent) {
                    this.includeContent = true
                }
                this.contentStr += `\n${file}:\n`
                this.contentStr += readFile(path.resolve(this.dir, file)) + '\n' + ENDOFFILE
            },
            getTokensShift(): number {
                return +(ls as any)('maxTokensShift') || 300
            },
            updateFilesStr(field: string, value: boolean, file?: string) {
                if (field === 'size') {
                    if (value) {
                        this.filesStr = this.filesStr.split("\n").map(f => {
                            const size = this.documentation.find(d => d.path === f.split(" ")[0])?.size
                            return f + (size ? " " + size + "bytes" : "")
                        }).join("\n")
                    } else {
                        this.filesStr = this.filesStr.split("\n").map(f => {
                            return f.replace(/\s\d+bytes/, "")
                        }).join("\n")
                    }
                } else {
                    if (value) {
                        this.filesStr = this.filesStr.split("\n").map(f => {
                            const filePath = f.split(" ")[0]
                            const description = this.documentation.find(d => d.path === filePath)?.description
                            return f + (description && (file ? filePath === file : true) ? " Description: " + description : "")
                        }).join("\n")
                    } else {
                        this.filesStr = this.filesStr.split("\n").map(f => {
                            const filePath = f.split(" ")[0]
                            return (file ? filePath === file : true) ? f.replace(/\sDescription:\s.+/, "") : f
                        }).join("\n")
                    }
                }
            },
            async askInsight(type) {
                if (!this.isLoading) {
                    try {
                        if (type === 'files') {
                            this.isFilesLoading = true
                        } else {
                            this.isLoading = true
                            this.loadingTime = 0
                            this.loadingInterval = setInterval(() => {
                                this.loadingTime += 0.1
                            }, 100)
                        }
                        if (this.config.stream !== false) {
                            this.result = ''
                            this.resultFiles = ''
                        }
                        this.error = ''
                        this.notEnoughTokens = false

                        const options = {
                            apiKey: (ls as any)("apiKey"),
                            ...this.config,
                            timeout: this.config.insightTimeout,
                            browser: true,
                        }
                        this.insight = new Insight([], options)
                        const maxTokensShift = this.getTokensShift()
                        let scrolled = false

                        if (type === 'files') {
                            this.resultFiles = await this.insight.askFiles(this.prompt, { filesStr: this.filesStr, maxTokensShift, ...this.config, timeout: this.config.insightTimeout || 120000, })
                        } else {
                            const askOptions = {
                                browser: true,
                                filesStr: this.includeFiles ? this.filesStr : undefined,
                                contentStr: this.includeContent ? this.contentStr : undefined,
                                maxTokensShift,
                                ...this.config,
                                timeout: this.config.insightTimeout || 120000,
                                rawPrompt: this.rawPrompt,
                                fData: (delta) => {
                                    this.result += delta
                                    this.config.stream !== false && !scrolled && setTimeout(() => {
                                        this.scrollToResult()
                                        scrolled = true
                                    }, 0)
                                }
                            }
                            const res = await this.insight.ask(this.prompt, askOptions)
                            console.log("AFTER insight.ask", { res });
                            (this.config.stream === false) && (this.result = '')
                        }

                        setTimeout(() => {
                            this.scrollToResult()
                        }, 0)
                    } catch (e) {
                        console.error("catch askInsight", { e })

                        // Error handling code ...
                    } finally {
                        if (type === 'files') {
                            this.isFilesLoading = false
                        } else {
                            clearInterval(this.loadingInterval)
                            this.isLoading = false
                        }
                    }
                } else {
                    this.insight.abort()
                    this.isLoading = false
                }
            },

        },

        created () {
            this.filesStr = this.files.map((file) => file.path).join("\n")
            console.log("After saveResult() in methods", { ROOT_DIR })
        },

        watch: {
            combinedWatchers: {
                handler (newVal) {
                    setTimeout(() => {
                        this.updateRawPrompt()
                    }, 0)
                }
            },
        },
    })

    </script>

<style lang="scss" scoped>
    .btn-run-files{
        background: #92d2c9;
    }

    .btn-run{
        background: #20b29e;
        color: whitesmoke;
    }

    .result{
        white-space: pre-line;
    }

</style>
