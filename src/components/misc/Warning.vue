<template>
    <div class="key-description bg-yellow-100 border border-yellow-300 text-yellow-700 px-4 py-3 rounded relative">
        <span class="block sm:inline">{{ value }}</span>
    </div>
</template>

<script lang='ts'>
    import { defineComponent } from "vue"

    export default defineComponent({
        props: {
            value: {
                type: String,
                default: () => 'Warning!'
            },

        },
        components: {

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

</style>
