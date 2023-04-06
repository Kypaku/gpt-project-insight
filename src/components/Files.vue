<template>
    <div class="files w-full">
        <div class="mb-2 text-lg">
            <b  >Files:</b>
        </div>
        <div class="flex items-center">
            <InputText
                class="text-sm"
                v-model:value="excludes"
                label="Excludes"
                placeholder="dir1,dir2,file3,*.png"
                @update:value="val => ls('excludes', val)"/>
        </div>
        <div class="selected-files flex flex-col items-start my-4">
            <File :file="item"  v-for="(item, i) in selectedFiles" :key="i"/>
        </div>
        <!-- <FileTree :items="nestedFiles" /> -->
    </div>
</template>

<script lang='ts'>
    import { defineComponent, PropType } from 'vue'

    import { IFile } from '@/../types'
    import { generateNestedFiles, NestedFile, getParentFolders } from '@/../helpers'
    import FileTree from './misc/FileTree.vue'
    import InputText from './misc/InputText.vue'
    import Accordeon from './misc/Accordeon.vue'
    import ls from 'local-storage'
    import File from '@/components/File.vue'
    import { maxTokens, bytesPerToken } from '../App.vue'

    export default defineComponent({
        props: {
            files: Array as PropType<IFile[]>,

        },
        components: {
            File,
            InputText,
            FileTree,
            Accordeon,
        },
        // emits: ['update:modelValue'], this.$emit('update:modelValue', title)
        data() {
            return {
                ls,
                excludes: ls("excludes") as unknown as string || '',

            }
        },
        computed: {
            selectedFiles(): IFile[] {
                const selected = this.files.filter((file) => {
                    const excludesCondition = this.excludes
                        .split(",")
                        .map((el) => el.trim())
                        .some((exclude) => exclude[0] === "*" ? !~file.path.lastIndexOf(exclude.slice(1)) : !~file.path.indexOf(exclude))
                    const maxSizeCondition = ((file.size || 0) <= (maxTokens - 150) * bytesPerToken)
                    return maxSizeCondition && ((!this.excludes) || excludesCondition)
                })
                const parentFolders = getParentFolders(selected.map(file => file.path)).filter((pathOne) => selected.find((file) => file.path === pathOne) === undefined)
                selected.push(...parentFolders.map(folder => ({ path: folder })))
                return selected
            },

            nestedFiles(): NestedFile[] {
                const res = generateNestedFiles(this.files)
                console.log("nestedFiles", { res })
                return res
            },

        },
        methods: {

        },
    })

    </script>

<style lang="scss" scoped>
    .path{
        min-width: 250px;
        text-align: left;
    }

</style>
