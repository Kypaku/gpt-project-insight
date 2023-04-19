<template>
    <Accordeon class="file gap-4 w-full" :class="{'hover:bg-gray-50': !(!file.description && file.state !== 'error')}"  :disabled="!file.description && file.state !== 'error'">
        <template #title>
            <div class="flex items-center" >
                <div class="path mr-4" >
                    {{ file.path }}
                </div>
                <div class="text-sm" :class="{'text-green-500': file.state === 'done', 'text-red-500': file.state === 'error'}">
                    {{ file.state || 'queue' }}
                </div>
                <button class="ml-4" v-if="file.state === 'queued' || !file.state"  @click="$emit('del')" >✕</button>
            </div>
        </template>
        <div>
            <div class="underline cursor-pointer text-sm" v-if="file.prompt" @click="showPrompt = !showPrompt">{{showPrompt ? 'Hide' : 'Show'  }} the prompt </div>
            <div class="text-sm" v-if="showPrompt">
                <b>Prompt</b>
                <div class="prompt" >
                    {{ file.prompt }}
                </div>
            </div>
            <div class="text-sm mt-1" >
                <b>Response</b>
                <div>
                    {{ file.description }}
                </div>
            </div>
        </div>
    </Accordeon>
</template>

<script lang='ts'>
    import { IFile } from 'types'
    import { defineComponent, PropType } from 'vue'
    import Accordeon from './misc/Accordeon.vue'

    export default defineComponent({
        props: {
            file: Object as PropType<IFile>,

        },
        components: {
            Accordeon,

        },
        // emits: ['update:modelValue'], this.$emit('update:modelValue', title)
        data() {
            return {
                showPrompt: false,

            }
        },
        computed: {

        },
        methods: {

        },
    })

    </script>

<style lang="scss" scoped>
    .path{
        min-width: 250px;
    }

    .prompt{
        white-space: pre-line;
    }

</style>
