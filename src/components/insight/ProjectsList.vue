<template>
    <Accordeon class="projects-list" title="Project lists">
        <List>

        </List>
    </Accordeon>
</template>

<script lang='ts'>
    import { defineComponent, PropType } from 'vue'

    import Accordeon from '@/components/misc/Accordeon.vue'
    import List from '@/components/misc/list/List.vue'

    export default defineComponent({
        props: {

        },
        components: {
            Accordeon,
            List,

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
