<template>
    <div class="input-api-key">
        <InputText
            class="mb-2"
            v-model:value="apiKey"
            :error="!apiKey"
            label="API Key"
            @update:value="val => (ls('apiKey', val), $emit('update:value', val))"  />
    </div>
</template>

<script lang='ts'>
    import { defineComponent, PropType } from 'vue'
    import ls from 'local-storage'
    import InputText from './InputText.vue'

    export default defineComponent({
        props: {

        },
        components: {
            InputText
        },
        data() {
            return {
                apiKey: ls("apiKey") as unknown as string || '' || process.env.OPENAI_KEY,
                ls
            }
        },
        computed: {

        },
        methods: {

        },
    })

    </script>

<style lang="scss" scoped>

</style>
