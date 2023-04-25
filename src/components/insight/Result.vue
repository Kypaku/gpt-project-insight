<template>
    <div>
        <b >Result: </b>
        <div class="result text-sm mt-2 bg-yellow-50 p-1 rounded" >
            {{ content }}
        </div>
        <div class="actions flex-center flex-wrap mt-2">
            <button
                class="action text-sm bg-blue-300 px-2 py-1 rounded-lg mb-2 mr-2"
                v-for="(action, i) in actions"
                :key="i"
                @click="action.handler">
                {{ action.name }}
            </button>
        </div>
    </div>
</template>

<script lang='ts'>
    import { defineComponent, PropType } from 'vue'

    import { StringIndexes, Action } from './ResultFiles.vue'
    import { openFile, sortByReverse } from '@/../helpers/node_gm'
    import { indexesOf } from '@/helpers'

    import path from 'path'

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
                const content = this.content // For tests: `I need a description of the file "src\\components\\TheFooter.vue" to determine how "src\\components\\TheFooter.vue to make "engine\\index.ts" the footer sticky. "src\\components"`
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
        },
        methods: {

        },
    })

    </script>

<style lang="scss" scoped>
    .result{
        white-space: pre-line;
    }
</style>
