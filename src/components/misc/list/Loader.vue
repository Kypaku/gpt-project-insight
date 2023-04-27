<template>
    <div class="loader-wrapper">
        <div class="loader"></div>
    </div>
</template>

<script lang='ts'>
    import { defineComponent } from "vue"

    export default defineComponent({
        props: {

        },
        components: {

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
    .loader-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
    }

    .loader {
        border: 8px solid #f3f3f3;
        border-top: 8px solid #46a575;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

</style>
