<template>
    <div>
        <Accordeon class="settings bg-gray-100 rounded" title="Settings">
            <InputText
                class="mb-2 max-queries"
                :value="(config as any)?.maxQueries || (defaultConfig as any).maxQueries"
                :placeholder="(defaultConfig as any).maxQueries || 5"
                label="Maximum number of requests simultaneously"
                @update:value="val => $emit('update:value', {...(config || defaultConfig), maxQueries: +val})"  />
            <InputText
                class="mt-2"
                label="Model"
                :value="(config as any)?.model || (defaultConfig as any).model"
                :placeholder="(defaultConfig as any).maxQueries || 'gpt-3.5-turbo-0301'"
                @update:value="val => $emit('update:value', {...(config || defaultConfig), model: val} )" />
            <InputText
                class="mt-2"
                label="Max Tokens File"
                :value="(config as any)?.maxTokensFile || (defaultConfig as any).maxTokensFile"
                :placeholder="(defaultConfig as any).maxQueries || 150"
                @update:value="val => $emit('update:value', {...(config || defaultConfig), maxTokensFile: +val} )" />
            <InputText
                class="mt-2"
                label="Max Tokens Directory"
                :value="(config as any)?.maxTokensDir || (defaultConfig as any).maxTokensDir"
                :placeholder="(defaultConfig as any).maxQueries || 300"
                @update:value="val => $emit('update:value', {...(config || defaultConfig), maxTokensDir: +val} )" />
            <InputText
                class="mt-2"
                label="Temperature"
                :value="(config as any)?.temperature || (defaultConfig as any).temperature"
                :placeholder="(defaultConfig as any).maxQueries || 0"
                @update:value="val => $emit('update:value', {...(config || defaultConfig), temperature: +val} )" />
        </Accordeon>
    </div>
</template>

<script lang='ts'>
    import { DocumentationGeneratorOptions } from 'engine'
    import { defineComponent, PropType } from 'vue'
    import InputText from './misc/InputText.vue'
    import Accordeon from './misc/Accordeon.vue'

    export default defineComponent({
        props: {
            config: {
                type: Object as PropType<DocumentationGeneratorOptions>,
                default: () => null
            },
            defaultConfig: Object as PropType<DocumentationGeneratorOptions>,
        },
        components: {
            InputText,
            Accordeon,
        },
        data() {
            return {

            }
        },
        computed: {

        },
        methods: {

        },
    })

    </script>

<style lang="scss" scoped>
    ::v-deep .settings{
        width: 400px
    }

</style>
