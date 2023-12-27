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
                :placeholder="(defaultConfig as any).model || 'gpt-3.5-turbo-0301'"
                :suggestions="modelSuggestions"
                @update:value="val => $emit('update:value', {...(config || defaultConfig), model: val} )" />
            <InputText
                class="mt-2"
                label="Max Tokens Model"
                :value="(config as any)?.maxTokensModel || (defaultConfig as any).maxTokensModel"
                :placeholder="(defaultConfig as any).maxTokensModel || 4097"
                @update:value="val => $emit('update:value', {...(config || defaultConfig), maxTokensModel: +val} )" />
            <InputText
                class="mt-2"
                label="Max Tokens Answer"
                :value="(config as any)?.maxTokensAnswer || (defaultConfig as any).maxTokensAnswer"
                :placeholder="(defaultConfig as any).maxTokensAnswer || 4097"
                @update:value="val => $emit('update:value', {...(config || defaultConfig), maxTokensAnswer: +val} )" />
            <InputText
                class="mt-2"
                label="Max Tokens File"
                :value="(config as any)?.maxTokensFile || (defaultConfig as any).maxTokensFile"
                :placeholder="(defaultConfig as any).maxTokensFile || 150"
                @update:value="val => $emit('update:value', {...(config || defaultConfig), maxTokensFile: +val} )" />
            <InputText
                class="mt-2"
                label="Max Tokens Directory"
                :value="(config as any)?.maxTokensDir || (defaultConfig as any).maxTokensDir"
                :placeholder="(defaultConfig as any).maxTokensDir || 300"
                @update:value="val => $emit('update:value', {...(config || defaultConfig), maxTokensDir: +val} )" />
            <InputText
                class="mt-2"
                label="Temperature"
                :value="(config as any)?.temperature || (defaultConfig as any).temperature"
                :placeholder="(defaultConfig as any).temperature || 0"
                @update:value="val => $emit('update:value', {...(config || defaultConfig), temperature: +val} )" />
            <InputText
                class="mt-2"
                label="Language"
                :value="(config as any)?.language || (defaultConfig as any).language"
                :placeholder="(defaultConfig as any).language || 'en'"
                @update:value="val => $emit('update:value', {...(config || defaultConfig), language: val} )" />
            <!-- <ToggleSwitch
                class="mt-2"
                v-model:value="enableAccurateTokenCounting"
                :disabled="!isPythonInstalled || isNaN(+couldNotRunScript)"
                :label="`Enable accurate token counting`"
                @update:value="val => ls('enableAccateTokenCounting', val)" />
            <Warning value="The system cannot run 'python'. The accurate token counting needs it" class="mt-2" v-if="!isPythonInstalled" />
            <Warning :value="`The system cannot run 'pyScript/countTokens.py:' ${couldNotRunScript}`" class="mt-2" v-if="isNaN(+couldNotRunScript)" />
            -->
            <InputText
                class="mt-2"
                label="Max Tokens Shift (Increase this value if you get 'Max tokens exceeded' error)"
                :value="maxTokensShift + ''"
                :placeholder="'100'"
                @update:value="val =>  ls('maxTokensShift', +val)" />
            <InputText
                class="mt-2"
                label="Documentation Timeout (ms)"
                :value="(config as any)?.documentationTimeout || (defaultConfig as any).documentationTimeout"
                :placeholder="(defaultConfig as any).documentationTimeout || 30000"
                @update:value="val => $emit('update:value', {...(config || defaultConfig), documentationTimeout: +val} )" />
            <InputText
                class="mt-2"
                label="Insight Timeout (ms)"
                :value="(config as any)?.insightTimeout || (defaultConfig as any).insightTimeout"
                :placeholder="(defaultConfig as any).insightTimeout || 120000"
                @update:value="val => $emit('update:value', {...(config || defaultConfig), insightTimeout: +val} )" />
            <ToggleSwitch
                class="mt-2"
                :value="(config as any)?.stream || (defaultConfig as any).stream || true"
                :label="`Enable streams`"
                @update:value="val => $emit('update:value', {...(config || defaultConfig), stream: val})" />
            <div class="dirs mt-4">
                <b class="" >Allowed directories:</b>
                <List
                    :addPlaceholder="'/path/to/dir'"
                    :items="config?.allowedDirs || (defaultConfig as any)?.allowedDirs || []"
                >
                    <template #default="{item}">
                        <!-- @add="({name, pos}) => setSettings('dirs', [name, ...(settings?.dirs || defaultSettings?.dirs || [])])"> -->
                        {{ item  }}
                    </template>
                </List>
            </div>
        </Accordeon>
    </div>
</template>

<script lang='ts'>
    import { DocumentationGeneratorOptions } from 'engine'
    import { defineComponent, PropType } from 'vue'
    import InputText, { InputTextSuggestion } from './misc/InputText.vue'
    import Accordeon from './misc/Accordeon.vue'
    import ToggleSwitch from './misc/ToggleSwitch.vue'
    import ls from 'local-storage'
    import { callPySync, isPythonInstalled } from '@/../helpers/node_gm'
    import Warning from './misc/Warning.vue'
    import * as path from 'path'
    import List from './misc/list/List.vue'
    import { InsightOptions } from 'engine/insight'

    export default defineComponent({
        props: {
            models: {
                type: Array as PropType<string[]>,
                default: () => []
            },
            config: {
                type: Object as PropType<DocumentationGeneratorOptions & InsightOptions>,
                default: () => null
            },
            defaultConfig: Object as PropType<DocumentationGeneratorOptions & InsightOptions>,
        },
        components: {
            List,
            InputText,
            Accordeon,
            ToggleSwitch,
            Warning
        },
        data() {
            return {
                maxTokensShift: +(ls as any)('maxTokensShift') || 300,
                couldNotRunScript: '',
                isPythonInstalled: false,
                enableAccurateTokenCounting: (ls as any)('enableAccurateTokenCounting') || false,
                ls

            }
        },
        computed: {
            modelSuggestions(): InputTextSuggestion[] {
                return this.models.map(model => ({ value: model, name: model }))
            },

        },
        methods: {

        },

        created () {
            // const scriptPath = path.resolve('pyScripts', 'countTokens.py')
            // this.isPythonInstalled = isPythonInstalled()
            // this.couldNotRunScript = this.isPythonInstalled && callPySync(scriptPath, 'Sample text to count tokens. Sample text to count tokens.')
            // if (this.isPythonInstalled && !isNaN(+this.couldNotRunScript) && !(ls as any)('enableAccurateTokenCounting') && window.localStorage.getItem('enableAccurateTokenCounting') !== 'false') {
            //     this.enableAccurateTokenCounting = true
            //     ls('enableAccurateTokenCounting', true)
            // }
        },
    })

    </script>

<style lang="scss" scoped>
    ::v-deep .settings{
        width: 100%;
    }

</style>
