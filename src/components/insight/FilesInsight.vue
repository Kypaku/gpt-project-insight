<template>
    <Accordeon title="Files" class="bg-gray-100 rounded mt-2 files-accorderon">
        <div class="w-full text-right px-2">
            <button class="text-sm underline"  @click="showRaw = !showRaw" >{{showRaw ? 'Hide' : 'Show'}} raw text</button>
        </div>
        <!-- <ToggleSwitch
            label="Only files from documentation"
            v-model="onlyDocsFiles"
        /> -->
        <input
            type="search"
            v-model="searchQuery"
            placeholder="Search files..."
            class="search-files w-full mb-2 py-2 px-2" />
        <div class="files-editor" v-if="!showRaw">
            <List :items="filteredFiles" @add="val => $emit('update:value', val.name + '\n' + value)" :add-placeholder="'relative/path/to/file'">
                <template #default="{item, index}">
                    <FileInsight
                        :file="item"
                        :index="index"
                        @addDescription="$emit('toggleDescription', {file: item.path, value: true})"
                        @removeDescription="$emit('toggleDescription', {file: item.path, value: false})"
                    />
                </template>
            </List>
        </div>
        <InputTextarea
            v-else
            :value="value"
            class="mt-2 w-full"
            :rows="10"
            @update:value="val => $emit('update:value', val)" />
    </Accordeon>
</template>

<script lang='ts'>
    import { defineComponent, PropType } from 'vue'
    import Accordeon from '../misc/Accordeon.vue'
    import List from '../misc/list/List.vue'
    import InputTextarea from '../misc/InputTextarea.vue'
    import { IFile } from '@/../types'
    import FileInsight from './FileInsight.vue'
    import ToggleSwitch from '../misc/ToggleSwitch.vue'

    export default defineComponent({
        props: {
            value: String,

        },
        components: {
            FileInsight,
            Accordeon,
            InputTextarea,
            List,
            ToggleSwitch
        },
        // emits: ['update:modelValue'], this.$emit('update:modelValue', title)
        data() {
            return {
                onlyDocsFiles: false,
                showRaw: false,
                searchQuery: '',

            }
        },
        computed: {
            files(): IFile[] {
                return this.value.split("\n").map((file: string, i) => {
                    return {
                        path: file.split(" ")?.[0],
                        size: file.match(/(\d+)bytes/)?.[1],
                        description: file.match(/\sDescription:\s(.+)$/)?.[1]
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

    ::v-deep.files-accorderon{
        .tab__content {
            padding: 0;
        }
    }

    .file{
        width: 200px;
        min-width: 200px;
    }

</style>
