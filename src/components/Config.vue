<template>
    <div class="config">
        <div>
            <b>Config: </b>
        </div>
        <div class="config flex-center">
            <span class="text-sm" :class="{'underline cursor-pointer': config}" @click="openConfig"> {{ configSource }}</span>
            <button class="ml-1" v-if="config"  @click="$emit('delConfig')" >✕</button>
            <button class="px-3 py-1 text-sm rounded bg-indigo-300 ml-2" @click="$emit('loadConfig')">Load config</button>
            <button v-if="configChanged || !config" class="px-3 py-1 text-sm rounded bg-indigo-300 ml-2" @click="$emit('saveConfig')">
                Save config <span v-if="configChanged">*</span>
            </button>
        </div>
    </div>
</template>

<script lang='ts'>
    import { shell } from 'electron'
    import { DocumentationGeneratorOptions } from 'engine'
    import { defineComponent, PropType } from 'vue'

    export default defineComponent({
        props: {
            config: Object as PropType<DocumentationGeneratorOptions>,
            configFile: String,
            configChanged: Boolean,

        },
        components: {

        },
        // emits: ['update:modelValue'], this.$emit('update:modelValue', title)
        data() {
            return {

            }
        },
        computed: {
            configSource(): string {
                if (this.configFile) {
                    return `${this.configFile}`
                }
                return `localhost (${location.origin})`
            },
        },
        methods: {
            openConfig() {
                if (this.configFile) {
                    shell.openPath(this.configFile)
                }
            },
        },
    })

    </script>

<style lang="scss" scoped>

</style>
