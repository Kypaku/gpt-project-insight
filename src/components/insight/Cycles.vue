<template>
    <Accordeon class="cycles" title="Cycles">
        <List :items="filteredFiles">
            <template #default="{item, index}">
                <div class="flex-center-between">
                    {{ index }}
                    {{ item }}
                </div>
            </template>
        </List>
    </Accordeon>
</template>

<script lang='ts'>
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

            }
        },
        computed: {
            filteredFiles(): IFile[] {
                const excludes = this.config.excludes
                return exclude(this.files, excludes || '', { maxTokens: this.config.maxTokensModel || 4097, bytesPerToken: 4, maxTokensFile: this.config.maxTokensFile })
            },

        },
        methods: {

        },
    })

    </script>

<style lang="scss" scoped>

</style>
