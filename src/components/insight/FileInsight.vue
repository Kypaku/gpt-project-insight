<template>
    <div class="flex-center-between mt-2 w-full file-insight" :class="{'bg-white':!(index%2)}">
        <div class="flex-grow file p-2">
            <div class="">{{file.path}}</div>
            <div class="text-xs" v-if="file.size">{{file.size}} bytes</div>
        </div>
        <div class="flex-grow-0">
            <div v-if="showDescription">
                <span class="text-xs">{{file.description}}</span>
            </div>
            <div class="flex-center mr-2">
                <button class="text-sm underline mr-2" v-if="file.description"  @click="showDescription = !showDescription" >{{showDescription ? 'Hide' : 'Show'}} description</button>
                <button class="text-sm underline"  @click="toggleDescription" >{{file.description ? 'Remove' : 'Add'}} description</button>
            </div>
        </div>
    </div>
</template>

<script lang='ts'>
    import { IFile } from 'types'
    import { defineComponent, PropType } from 'vue'

    export default defineComponent({
        props: {
            file: Object as PropType<IFile>,
            index: Number,

        },
        components: {

        },
        // emits: ['update:modelValue'], this.$emit('update:modelValue', title)
        data() {
            return {
                showDescription: false,

            }
        },
        computed: {

        },
        methods: {
            toggleDescription() {
                if (this.file.description) {
                    this.$emit('removeDescription')
                } else {
                    this.$emit('addDescription')
                }
            },

        },
    })

    </script>

<style lang="scss" scoped>

</style>
