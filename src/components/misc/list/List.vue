<template>
    <div class="list-comp flex flex-col items-center">
        <div class="list-add-wrapper" v-if="$slots.add" v-show="!hideTopAdd">
            <slot name="add" :add="val => $emit('add', {name: val, pos: 0})" :index="0"/>
        </div>
        <ListAdd
            v-else
            @add="val => $emit('add', {name: val, pos: 0})"
            v-show="!hideTopAdd"
            :placeholder="addPlaceholder"/>
        <Loader v-if="loading"/>
        <template v-else>
            <template v-for="(item, i) in items" :key="i">
                <slot
                    v-if="$slots.default"
                    :item="item"
                    :index="i"
                    @click="$emit('select', item)"/>
                <button class="notebook bg-blue-500 p-1" @click="$emit('select', item)" v-else>
                    {{item.name}}
                </button>
                <ListAddLine
                    class="w-full"
                    v-if="addInPos"
                    @add="val => $emit('add', {name: val, pos: i + 1})"
                    :index="i"
                    :ref="'addLine' + (i + 1)"
                    :placeholder="addPlaceholder"
                >
                    <slot
                        name="add"
                        v-if="$slots.add"
                        :add="val => addFromSlot(val, i + 1)"
                        :index="i"/>
                </ListAddLine>
            </template>
        </template>

    </div>
</template>

<script lang='ts'>
    import { defineComponent, PropType } from "vue"
    import ListAdd from "./ListAdd.vue"
    import ListAddLine from "./ListAddLine.vue"
    import Loader from "./Loader.vue"

    export default defineComponent({
        props: {
            addPlaceholder: {
                type: String,
                default: () => "Name"
            },
            loading: {
                type: Boolean,
                default: () => false
            },
            items: Array,
            addInPos: Boolean,
            hideTopAdd: Boolean
        },
        components: {
            Loader,
            ListAddLine,
            ListAdd,

        },
        data() {
            return {

            }
        },
        computed: {

        },
        methods: {
            addFromSlot(val: string, index: number) {
                this.$emit("add", { name: val, pos: index });
                (this.$refs["addLine" + index] as any)[0].showInput = false
            },
        },
    })

    </script>

<style lang="scss">

</style>
