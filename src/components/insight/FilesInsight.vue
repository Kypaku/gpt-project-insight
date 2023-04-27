<template>
    <Accordeon title="Files" class="bg-gray-100 rounded mt-2 files-accorderon">
        <div class="w-full text-right px-2">
            <button class="text-sm underline"  @click="showRaw = !showRaw" >{{showRaw ? 'Hide' : 'Show'}} raw text</button>
        </div>
        <div class="files-editor" v-if="!showRaw">
            <List :items="files" @add="val => $emit('update:value', val.name + '\n' + value)" :add-placeholder="'relative/path/to/file'">
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

    export default defineComponent({
        props: {
            value: String,

        },
        components: {
            FileInsight,
            Accordeon,
            InputTextarea,
            List,
        },
        // emits: ['update:modelValue'], this.$emit('update:modelValue', title)
        data() {
            return {
                showRaw: false,

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

        },
        methods: {

        },
    })

    </script>

<style lang="scss" scoped>
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
