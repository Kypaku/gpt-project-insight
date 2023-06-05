<template>
    <div class="stat flex flex mt-2 text-sm">
        <div class="mr-4" >
            Tokens: ~{{ promptSize }}
        </div>
        <div>
            Remaining: ~{{ maxTokens - promptSize }}
        </div>
        <!-- <div class="ml-4">
            Price: ${{ price.toFixed(2) }}
        </div> -->
    </div>
</template>

<script lang='ts'>
    import { defineComponent, PropType } from 'vue'

    export default defineComponent({
        props: {
            promptSize: Number,
            maxTokens: Number,
            price: Number,

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

</style>
