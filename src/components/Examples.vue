<template>
    <div class="examples-wrap">
        <div>
            <button @click="showExamples = !showExamples" class="underline text-sm" >{{showExamples ? 'Hide' : 'Show'}} examples</button>
        </div>
        <div class="examples text-sm" v-if="showExamples">
            <div class="example" v-for="(item, i) in examples" :key="i">
                <div class="cursor-pointer" @click="$emit('apply', item)">{{item}}</div>
            </div>
        </div>
    </div>
</template>

<script lang='ts'>
    import { defineComponent, PropType } from 'vue'

    export default defineComponent({
        props: {

        },
        components: {

        },
        // emits: ['update:modelValue'], this.$emit('update:modelValue', title)
        data() {
            return {
                showExamples: false,
                examples: [
                    'Make the footer sticky',
                    'How to install the project',
                    'How to create a script: npm run ',
                    'Create README.md and its content',
                ],
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
