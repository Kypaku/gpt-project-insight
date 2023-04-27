<template>
    <div class="list-add-line" :class="{closed: !showInput}">
        <div v-if="!showInput" @click="showInput = true" class="cursor-pointer flex plus-wrap">
            <hr class="flex-grow border-2"/>
            <button class="bg-gray-300 px-2 plus-button">+</button>
        </div>
        <div v-if="$slots.default" v-show="showInput">
            <slot/>
        </div>
        <ListAdd v-show="showInput" @add="add" :placeholder="placeholder"/>
    </div>
</template>

<script lang='ts'>
    import { defineComponent } from 'vue'
    import ListAdd from './ListAdd.vue'

    export default defineComponent({
        props: {
            placeholder: {
                type: String,
                default: () => "Name"
            },
            index: Number,

        },
        components: {
            ListAdd,

        },
        data() {
            return {
                showInput: false,

            }
        },
        computed: {

        },
        methods: {
            add(val: string) {
                this.$emit('add', val)
                this.showInput = false
            },
        },
    })

    </script>

<style lang="scss" scoped>
    .list-add-line{
        &.closed{

            height: 10px;
        }
    }
    .plus-wrap{
        // margin-top: 2px;
        opacity: 0;
        &:hover{
            opacity: 1;
        }
    }
    .plus-button{
        line-height: 1;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
    }
</style>
