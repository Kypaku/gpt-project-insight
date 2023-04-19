<template>
    <div class="files w-full">
        <div class="mb-2 text-lg">
            <b  >Files:</b>
        </div>
        <div class="flex items-center">
            <InputTextarea
                class="text-sm w-full"
                :value="excludes"
                label="Excludes"
                placeholder="dir1,dir2,file3,*.png"
                @update:value="val => $emit('updateExcludes', val)"/>
        </div>
        <div class="selected-files flex flex-col items-start my-4">
            <File :file="item"  v-for="(item, i) in files" :key="`${item.path}_${item.state}`" @del="del(item)"/>
        </div>
        <!-- <FileTree :items="nestedFiles" /> -->
    </div>
</template>

<script lang='ts'>
    import { defineComponent, PropType } from 'vue'

    import { IFile } from '@/../types'
    import { generateNestedFiles, NestedFile, getParentFolders, getUpdatedParentFolders } from '@/../helpers'
    import FileTree from './misc/FileTree.vue'
    import InputTextarea from './misc/InputTextarea.vue'
    import Accordeon from './misc/Accordeon.vue'
    import ls from 'local-storage'
    import File from '@/components/File.vue'
    import { maxTokens, bytesPerToken } from '../App.vue'
    import { DocumentationGeneratorOptions } from 'engine'
    import { getFileDate, isDirectory } from '@/../helpers/node_gm'

    export default defineComponent({
        props: {
            isUpdateLoading: {
                type: Boolean,
                default: () => false
            },
            dir: {
                type: String,
                default: () => ''
            },
            prevResult: {
                type: Array as PropType<IFile[]>,
                default: () => []
            },
            files: Array as PropType<IFile[]>,
            config: {
                type: Object as PropType<DocumentationGeneratorOptions>,
                default: () => null
            },
            defaultConfig: {
                type: Object as PropType<DocumentationGeneratorOptions>,
                default: () => null
            },
        },
        components: {
            File,
            InputTextarea,
            FileTree,
            Accordeon,
        },
        // emits: ['update:modelValue'], this.$emit('update:modelValue', title)
        data() {
            return {
                ls,
            }
        },
        computed: {
            excludes(): string {
                return (this.config as any)?.excludes || (this.defaultConfig as any)?.excludes || ''
            },

            nestedFiles(): NestedFile[] {
                const res = generateNestedFiles(this.files)
                console.log("nestedFiles", { res })
                return res
            },

        },
        methods: {
            del(item: IFile) {
                this.$emit('updateExcludes', (this.excludes ? this.excludes + ', ' : '') + item.path)
            },

        },
    })

    </script>

<style lang="scss" scoped>
    .path{
        min-width: 250px;
        text-align: left;
    }

</style>
