<template>
    <div class="tab-insight w-full">
        <div>
            <button @click="showExamples = !showExamples" class="underline text-sm" >{{showExamples ? 'Hide' : 'Show'}} examples</button>
        </div>
        <div class="examples text-sm" v-if="showExamples">
            <div class="example" v-for="(item, i) in examples" :key="i">
                <div class="cursor-pointer" @click="prompt = item">{{item}}</div>
            </div>
        </div>
        <b>Prompt</b>
        <InputTextarea v-model:value="prompt" class="mt-2 w-full" />
        <button @click="setToDefault" class="underline text-sm" >Set to default</button>
        <ToggleSwitch class="mt-2" v-model:value="includeFiles" :label="`Include files (+${lengthToTokensCount(filesStr.length)} tokens)`" />
        <ToggleSwitch
            class="mt-2"
            v-model:value="includeSize"
            :label="`Include size (+${sizeSize} tokens)`"
            @update:value="val => updateFilesStr('size', val)" />
        <ToggleSwitch
            class="mt-2"
            v-model:value="includeDescription"
            :label="`Include description (+${descriptionSize} tokens)`"
            @update:value="val => updateFilesStr('description', val)" />
        <ToggleSwitch class="mt-2" v-model:value="includeContent" :label="`Include content (+${lengthToTokensCount(contentStr.length)} tokens)`" />
        <Accordeon title="Files" class="bg-gray-100 rounded mt-2" v-if="includeFiles">
            <InputTextarea v-model:value="filesStr" class="mt-2 w-full" :rows="10" />
        </Accordeon>
        <Accordeon title="Content" class="bg-gray-100 rounded mt-2"  v-if="includeContent">
            <InputTextarea v-model:value="contentStr" class="mt-2 w-full text-xs" :rows="10"/>
        </Accordeon>
        <div class="stat flex flex-col mt-2 text-sm">
            <div>
                Tokens: ~{{ promptSize }}
            </div>
            <div>
                Rest: ~{{ maxTokens - promptSize }}
            </div>
        </div>
        <div class="buttons mt-2">
            <button
                class="px-2 py-1 rounded mb-2 mr-2"
                :disabled="isFilesLoading || isLoading"
                :class="isFilesLoading ? 'opacity-50 bg-green-200' : 'bg-green-200'"
                @click="askFiles()">
                Ask for files
                <!-- {{isFilesLoading ? 'Stop' : 'Ask for files'}} -->
            </button>
            <button
                class="px-4 py-1 rounded mb-2 mr-2"
                :disabled="isLoading || isFilesLoading"
                :class="isLoading ? 'opacity-50 bg-green-300' : 'bg-green-300'"
                @click="ask()">
                <b><!--{{isLoading ? 'Stop' : 'Run'}} -->Run</b>
            </button>
        </div>
        <Error :value="error" v-if="error" class="mt-2"  />
        <Warning
            class="mt-2"
            :value="'If you have not enough tokens for the prompt you need to increase \'Max Tokens Shift\' in the settings.'"
            v-if="notEnoughTokens" />
        <!-- enable \'accurate token counting\' or -->

        <Result
            :content="result"
            v-if="result"
            class="mt-2"
            :files="files"
            :dir="dir"
        />
        <ResultFiles
            class="result mt-2"
            :content="resultFiles"
            v-if="resultFiles"
            :files="files"
            :filesStr="filesStr"
            :documentation="documentation"
            :contentStr="contentStr"
            @updateFilesStr="({field, file}) => updateFilesStr(field, true, file)"
            @addFileContent="file => addFileToContentStr(file)"
        />
    </div>
</template>

<script lang='ts'>
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
    import { lengthToTokensCount } from '@/../helpers'
    import { DocumentationGeneratorOptions } from 'engine'
    import ResultFiles from '@/components/insight/ResultFiles.vue'
    import { readFile } from '@/../helpers/node_gm'
    import Result from '@/components/insight/Result.vue'

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
                showExamples: false,
                examples: [
                    'Make the footer sticky',
                    'How to install the project',
                    'How to create a script: npm run ',
                    'Create README.md and its content',
                ],
                resultFiles: "",
                error: "",
                contentStr: "",
                includeContent: false,
                includeDescription: false,
                includeSize: false,
                filesStr: "",
                includeFiles: true,
                result: "",
                isLoading: false,
                isFilesLoading: false,
                prompt: "",
                insight: null as Insight | null,
                bytesPerToken,
                maxTokens,
                notEnoughTokens: false,
                lengthToTokensCount,
            }
        },
        computed: {
            files(): string[] {
                return this.documentation.map(f => f.path)
            },

            promptSize(): number {
                return lengthToTokensCount((this.prompt.length + (this.includeFiles ? this.filesStr.length : 0) + (this.includeContent ? this.contentStr.length : 0))) + this.getTokensShift()
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
            }
        },
        methods: {
            setToDefault() {
                this.includeContent = false
                this.includeDescription = false
                this.includeSize = false
                this.includeFiles = true
                this.contentStr = ""
                this.filesStr = this.files.join("\n")
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
                this.contentStr += readFile(file)
            },
            getTokensShift(): number {
                return +(ls as any)('maxTokensShift') || 100
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
                            return f.replace(/\sDescription:\s.+/, "")
                        }).join("\n")
                    }
                }
            },

            async askFiles() {
                try {
                    this.isFilesLoading = true
                    this.error = ''
                    this.notEnoughTokens = false
                    const options = {
                        apiKey: (ls as any)("apiKey"),
                        ...this.config,
                    }

                    const maxTokensShift = this.getTokensShift()
                    this.insight = new Insight([], options)
                    this.resultFiles = await this.insight.askFiles(this.prompt, { filesStr: this.filesStr, maxTokensShift, ...this.config, timeout: this.config.insightTimeout, })
                } catch (e) {
                    console.error("catch askFiles", { e })
                    if (e.response?.data?.error?.message) {
                        this.error = e.response.data.error.message
                        if (e.response?.data?.error?.code === 'context_length_exceeded') {
                            this.notEnoughTokens = true
                        }
                    }
                } finally {
                    this.isFilesLoading = false
                }
            },
            async ask() {
                try {
                    this.isLoading = true
                    this.error = ''
                    this.notEnoughTokens = false

                    const options = {
                        apiKey: (ls as any)("apiKey"),
                        ...this.config,
                        timeout: this.config.insightTimeout,
                    }
                    const maxTokensShift = this.getTokensShift()

                    this.insight = new Insight([], options)
                    const askOptions = {
                        filesStr: this.includeFiles ? this.filesStr : undefined,
                        contentStr: this.includeContent ? this.contentStr : undefined,
                        maxTokensShift,
                        ...this.config,
                        timeout: this.config.insightTimeout,

                    }
                    this.result = await this.insight.ask(this.prompt, askOptions)
                } catch (e) {
                    console.error("catch ask", { e })
                    if (e.response?.data?.error?.message) {
                        this.error = e.response.data.error.message
                        if (e.response?.data?.error?.code === 'context_length_exceeded') {
                            this.notEnoughTokens = true
                        }
                    }
                } finally {
                    this.isLoading = false
                }
            },

        },

        created () {
            this.filesStr = this.files.join("\n")
        },
    })

    </script>

<style lang="scss" scoped>
    .result{
        white-space: pre-line;
    }

</style>
