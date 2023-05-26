<template>
    <div class="result-files">
        <b>Ask for files result:</b>
        <div class="content text-sm">
            <template v-for="(segment, i) in segments">
                <div :key="i" class="code-block  mb-1" v-if="segment.isCode">
                    <pre class="overflow-auto max-h-80"><code>{{ segment.text.trim()}}</code></pre>
                </div>
                <span :key="i + 'text'" v-else>{{ segment.text }}</span>
            </template>
        </div>
        <div class="actions flex-center flex-wrap mt-2">
            <button
                class="action text-sm px-2 py-1 rounded-lg mb-2 mr-2"
                v-for="(action, i) in actions"
                :key="i"
                @click="action.handler">
                {{ action.name }}
            </button>
        </div>
    </div>
</template>

<script lang='ts'>
    import { sortByReverse } from '@/../helpers/node_gm'
    import { defineComponent, PropType } from 'vue'
    import { indexesOf } from '@/helpers'
    import { IFile } from 'types'
    import { lengthToTokensCount } from '@/../helpers'

    export interface Action{
        name: string
        handler: () => void
    }

    export interface StringIndexes {
        string: string
        indexes: number[]
    }

    export default defineComponent({
        props: {
            contentStr: {
                type: String,
                default: () => ''
            },
            documentation: {
                type: Array as PropType<IFile[]>,
                default: () => []
            },
            filesStr: {
                type: String,
                default: () => ''
            },
            files: {
                type: Array as PropType<string[]>,
                default: () => []
            },
            content: String,

        },
        components: {

        },
        data() {
            return {

            }
        },
        computed: {
            actions(): Action[] {
                const filesLines = this.filesStr.split('\n')
                return this.uniqMatchedFiles.map((matchedFile) => {
                    const fileHasDescription = filesLines.some((fileLine) => {
                        const fileLineParts = fileLine.split(' ')
                        const fileLinePath = fileLineParts[0]
                        return fileLinePath === matchedFile.string && fileLine.includes(' Description: ')
                    })
                    const doc = this.documentation.find((docFile) => docFile.path === matchedFile.string)
                    const description = doc?.description
                    const descriptionTokens = lengthToTokensCount(description?.length || 0)
                    const fileHasContent = this.contentStr.includes(matchedFile.string + ':')
                    return [!fileHasDescription && descriptionTokens && {
                                name: `Add ${matchedFile.string} Description (+${descriptionTokens} tokens)`,
                                handler: () => {
                                    this.$emit('updateFilesStr', { field: 'description', file: matchedFile.string })
                                }
                            },
                            !fileHasContent && doc.size && {
                                name: `Add ${matchedFile.string} Content (+${lengthToTokensCount(doc.size)} tokens))`,
                                handler: () => {
                                    this.$emit('addFileContent', matchedFile.string)
                                }
                            }].filter(Boolean) as Action[]
                }).flat()
            },

            sortedFiles(): string[] {
                return sortByReverse(this.files.filter((file) => file !== '.'), (f) => f.length)
            },
            matchedFiles(): StringIndexes[] {
                const content = this.content // For tests: `I need a description of the file "src\\components\\TheFooter.vue" to determine how "src\\components\\TheFooter.vue to make "engine\\index.ts" the footer sticky. "src\\components"`
                const res = []
                this.sortedFiles.forEach((sortedFile) => {
                    const indexes = indexesOf(content.replaceAll('\\', '/'), sortedFile.replaceAll('\\', '/'))
                    if (indexes.length) {
                        res.push({
                            string: sortedFile,
                            indexes
                        })
                    }
                })
                return res
            },
            uniqMatchedFiles(): StringIndexes[] {
                return this.matchedFiles.filter((matchedFile, i) => {
                    const prevMatchedFiles = this.matchedFiles.slice(0, i)
                    const condition = prevMatchedFiles.some(prevEl => {
                        return matchedFile.indexes.every(index => {
                            return prevEl.indexes.some(prevIndex => {
                                return (prevIndex <= index && index < prevIndex + prevEl.string.length)
                            })
                        })
                    })
                    if (condition) {
                        return false
                    } else {
                        return true
                    }
                })
            },
            segments(): {isCode?: boolean, text: string}[] {
                const divider = "`" + "`" + "`"
                return this.content?.split(divider)?.map((dividerOne, i) => ({ isCode: !!(i % 2), text: dividerOne.trim() })) || []
            },
        },
        methods: {

        },
    })

    </script>

<style lang="scss" scoped>
    .action{
        background: rgb(219, 235, 240);
    }

    .button-copy{

border-bottom-left-radius: 0.5rem;
border-bottom-right-radius: 0.5rem;
}

.result-body{
white-space: pre-wrap;
}

.code-block {
display: flex;
flex-direction: column;
    .language {
    font-size: 0.8rem;
    color: #6b7280;
    }
    pre {
    background-color: #202124;
    color: beige;
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    padding: 0 1rem;
    overflow-x: auto;
    }
    code {
    font-family: "Fira Code", monospace;
    font-size: 0.9rem;
    line-height: 1.2rem;
    white-space: pre-wrap;
    word-break: break-word;
    }
}
</style>
