<template>
    <div class="result">
        {{ res }}
    </div>
</template>

<script lang='ts'>
    import { defineComponent } from 'vue'
    import { PropType } from 'vue'

    export default defineComponent({
        props: {
            res: Object as PropType<any>,

        },
        components: {

        },
        //emits: ['update:modelValue'], this.$emit('update:modelValue', title)
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
