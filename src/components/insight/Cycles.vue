<template>
    <Accordeon class="cycles" title="Cycles">
        <button
            class="px-4 py-1 rounded mb-2 mr-2 btn-run"
            :disabled="isLoading"
            @click="run">
            <b>{{isLoading ? 'Stop' : 'Run'}} <span v-show="loadingTime" class="font-normal" >
                ({{ loadingTime.toFixed(1) }}s)</span>
            </b>
        </button>
        <List :items="filteredFiles">
            <template #default="{item, index}">
                <div class="flex-center-between">
                    {{ index }}
                    {{ item.path }}
                </div>
            </template>
        </List>
    </Accordeon>
</template>

<script lang='ts'>
    import { filter } from 'lodash'
    import { defineComponent, PropType } from 'vue'

    import List from '@/components/misc/list/List.vue'
    import Accordeon from '@/components/misc/Accordeon.vue'
    import { IFile } from 'types'
    import FileInsight from './FileInsight.vue'
    import { exclude } from '@/../helpers'

    export default defineComponent({
        props: {
            files: {
                type: Array as PropType<IFile[]>,
                default: () => []
            },
            config: {
                type: Object,
                default: () => {}
            },
        },
        components: {
            FileInsight,
            List,
            Accordeon,

        },
        // emits: ['update:modelValue'], this.$emit('update:modelValue', title)
        data() {
            return {
                loadingTime: 0,
                isLoading: false,

            }
        },
        computed: {
            filteredFiles(): IFile[] {
                const excludes = this.config.excludes
                return exclude(this.files, excludes || '', { maxTokens: this.config.maxTokensModel || 4097, bytesPerToken: 4, maxTokensFile: this.config.maxTokensFile })
            },

        },
        methods: {
            run() {
                this.isLoading = true
                try {
                    this.filterFiles.forEach((filterFile) => {
                        // need to use api instance
                    })
                } catch (e) {
                    console.error('Cycle run error:', e)
                    const { toast } = require("vue3-toastify")
                    toast.error('Cycle run error: ' + e.message)
                } finally {
                    this.isLoading = false
                }
            },

        },
    })

    </script>

<style lang="scss" scoped>

</style>
