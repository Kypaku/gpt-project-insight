<template>
    <Accordeon class="project-description bg-gray-100" title="Project Description">
        <InputTextarea
            class="w-full"
            v-model="projectDescription"
            autoResize="true"
            rows="5"
        />
    </Accordeon>
</template>

<script lang='ts'>
    import { defineComponent, PropType } from 'vue'
    import Accordeon from './misc/Accordeon.vue'
    import InputTextarea from './misc/InputTextarea.vue'

    export default defineComponent({
        props: {

        },
        components: {
            Accordeon,
            InputTextarea
        },
        // emits: ['update:modelValue'], this.$emit('update:modelValue', title)
        data() {
            return {
                projectDescription: "",

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
