<template>
    <Accordeon class="cycles" title="Cycles">
        <List :items="files">
            <template #default="{item, index}">
                <FileInsight
                    :file="item"
                    :index="index"
                />
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

    export default defineComponent({
        props: {
            files: {
                type: Array as PropType<string[]>,
                default: () => []
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

        },
        methods: {

        },
    })

    </script>

<style lang="scss" scoped>

</style>
