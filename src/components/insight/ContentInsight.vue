<template>
    <Accordeon title="Content" class="bg-gray-100 rounded mt-2">
        <div class="w-full text-right px-2">
            <button class="text-sm underline"  @click="showRaw = !showRaw" >{{showRaw ? 'Hide' : 'Show'}} raw text</button>
        </div>
        <input
            type="search"
            v-model="searchQuery"
            placeholder="Search files..."
            class="search-files w-full mb-2 py-1 px-2" />
        <div class="files-editor" v-if="!showRaw">
            <List :items="filteredFiles" @add="val => $emit('update:value', val.name + '\n' + value)" :hideTopAdd="true">
                <template #default="{item, index}">
                    <div class="flex-center-between w-full">
                        <div class="flex-grow file p-2">
                            <div class="">{{item.path}}</div>
                            <div class="text-xs" v-if="item.size">{{lengthToTokensCount(item.size)}} tokens</div>
                        </div>
                        <div class="flex-grow-0">
                            <button class="text-sm underline"  @click="toggleContent(item)" >{{item.content ? 'Remove' : 'Add'}} content</button>

                        </div>
                    </div>
                </template>
            </List>
        </div>
        <InputTextarea
            v-else
            :value="value"
            @update:value="val => $emit('update:value', val)"
            class="mt-2 w-full text-xs"
            :rows="10"/>
    </Accordeon>
</template>

<script lang='ts'>
    import { defineComponent, PropType } from 'vue'
    import Accordeon from '../misc/Accordeon.vue'
    import InputTextarea from '../misc/InputTextarea.vue'
    import { IFile } from 'types'
    import List from '../misc/list/List.vue'
    import { getFileSize, readFile } from '@/../helpers/node_gm'
    import path from 'path'
    import { ENDOFFILE } from '../TabInsight.vue'
    import { lengthToTokensCount } from '@/../helpers'

    export default defineComponent({
        props: {
            value: String,
            documentation: {
                type: Array as PropType<IFile[]>,
                default: () => []
            },
            dir: {
                type: String,
                default: () => ''
            },
        },
        components: {
            Accordeon,
            InputTextarea,
            List
        },
        // emits: ['update:modelValue'], this.$emit('update:modelValue', title)
        data() {
            return {
                lengthToTokensCount,
                showRaw: false,
                searchQuery: '',
            }
        },
        computed: {
            files(): IFile[] {
                return this.documentation.map((file: IFile, i) => {
                    const index = this.value.indexOf(file.path + ":")
                    return {
                        path: file.path,
                        size: file.fullPath ? getFileSize(file.fullPath) : file.size,
                        content: index !== -1
                    }
                })
            },
            filteredFiles(): IFile[] {
                if (!this.searchQuery) return this.files
                const query = this.searchQuery.toLowerCase()
                return this.files.filter(file => file.path.toLowerCase().includes(query))
            },
        },
        methods: {
            toggleContent(item: IFile) {
                if (item.content) {
                    const index = this.value.indexOf(item.path + ":")
                    const slicedValue = this.value.slice(0, index)
                    const nextIndex = this.value.indexOf(ENDOFFILE, index)
                    const slicedNextValue = this.value.slice(nextIndex + ENDOFFILE.length, -1)
                    this.$emit('update:value', slicedValue + slicedNextValue)
                } else {
                    this.$emit('update:value', this.value + '\n' + item.path + ":\n" + readFile(path.resolve(this.dir, item.path)) + '\n' + ENDOFFILE)
                }
            },

        },
    })

    </script>

<style lang="scss" scoped>
    .search-files{
        border-bottom: 1px solid #ccc;
    }

    .files-editor{
        max-height: 400px;
    overflow-y: scroll;
    }

</style>
