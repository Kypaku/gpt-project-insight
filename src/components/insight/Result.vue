<template>
    <div>
        <b>Result: </b>
        <div class="result text-sm mt-2 bg-yellow-50 p-2 rounded">
            <template v-for="(segment, i) in segments">
                <div :key="i" class="code-block mb-1" v-if="segment.isCode">
                    <pre class="overflow-auto max-h-80"><code v-html="highlightCode(segment.text.trim())"></code></pre>
                </div>
                <span :key="i + 'text'" v-else v-html="renderLinks(segment.text)"></span>
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
        <button
            class="action text-sm px-2 py-1 rounded-lg mb-2 mr-2"
            @click="copyResult">
            Copy Result
        </button>
    </div>
</template>

<script lang='ts'>
    import { defineComponent, PropType } from 'vue'

    import { StringIndexes, Action } from './ResultFiles.vue'
    import { openFile, sortByReverse } from '@/../helpers/node_gm'
    import { indexesOf } from '@/helpers'
    import Prism from 'prismjs'
    import 'prismjs/themes/prism-tomorrow.css'
    import path from 'path'
    import { copy } from '@/../helpers'

    export default defineComponent({
        props: {
            dir: {
                type: String,
                default: () => ''
            },
            content: String,
            files: {
                type: Array as PropType<string[]>,
                default: () => []
            },
        },
        components: {

        },
        data() {
            return {

            }
        },
        computed: {
            actions(): Action[] {
                return this.uniqMatchedFiles.map((matchedFile) => {
                    return {
                        name: `Open ${matchedFile.string}`,
                        handler: () => {
                            openFile(path.resolve(this.dir, matchedFile.string))
                        }
                    }
                })
            },
            sortedFiles(): string[] {
                return sortByReverse(this.files.filter((file) => file !== '.'), (f) => f.length)
            },
            matchedFiles(): StringIndexes[] {
                const content = this.content
                const res = []
                this.sortedFiles.forEach((sortedFile) => {
                    const indexes = indexesOf(content, sortedFile)
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
            copyResult() {
                copy(this.content)
            },
            // renderLinks(text) {
            //     this.uniqMatchedFiles.forEach((matchedFile) => {
            //         const fileRawPath = matchedFile.string
            //         const filePath = path.resolve(this.dir, fileRawPath)
            //         const link = `<a href="#" class="underline" @click.prevent="openFile('${filePath}')">${fileRawPath}</a>`
            //         const replacers = [
            //             fileRawPath,
            //             fileRawPath.replaceAll('/', '\\'),
            //             fileRawPath.replaceAll('\\', '/')
            //         ]
            //         console.log("After renderLinks function", {replacers});
            //         replacers.forEach((replacer) => {
            //             text = text.replaceAll(replacer, link)
            //         })
            //     })
            //     return text
            // },
            renderLinks(text) {
                const replacedLinks = new Set() // set to keep track of replaced links
                this.uniqMatchedFiles.forEach((matchedFile) => {
                    const fileRawPath = matchedFile.string
                    const filePath = path.resolve(this.dir, fileRawPath)
                    const link = `<a href="#" class="underline" @click.prevent="openFile('${filePath}')">${fileRawPath}</a>`
                    const replacers = [
                        fileRawPath,
                        fileRawPath.replaceAll('/', '\\'),
                        fileRawPath.replaceAll('\\', '/')
                    ]
                    console.log("After renderLinks function", { replacers })
                    replacers.forEach((replacer) => {
                        if (!replacedLinks.has(replacer)) { // check if link has already been replaced
                            text = text.replaceAll(replacer, link)
                            replacedLinks.add(replacer) // add link to set of replaced links
                        }
                    })
                })
                return text
            },

            highlightCode(code): string {
                return Prism.highlight(code, Prism.languages.javascript, 'javascript').replace(/\w+/, "").trim()
            },
        },
    })

</script>

<style lang="scss" scoped>
    .result{
        white-space: pre-wrap;
    }
    .action{
        background: rgb(219, 235, 240);
    }
    .button-copy{

    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
    }

    .result-body{
    white-space: pre-line;
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
        border-radius: 0.5rem;
        border-radius: 0.5rem;
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
