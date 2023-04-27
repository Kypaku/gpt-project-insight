<template>
    <div class="list-add input-form flex-center">
        <!-- @keydown.tab.exact.prevent="(name = suggestionsFiltred[0])" -->
        <input
            type="text"
            v-model="name"
            :placeholder="placeholder"
            class="border-2 border-gray-300 p-1 flex-grow text-black rounded-l"
            @keypress.enter="add"/>
        <button class="bg-gray-300 p-1 text-black border-2 border-gray-300 rounded-r" :disabled="!name" @click="add">Add</button>
        <!-- <Suggestions :items="suggestionsFiltred" :all="suggestions" @select="val => (name = val.name)"/> -->
    </div>
</template>

<script lang='ts'>
    import { defineComponent, PropType } from 'vue'

    export default defineComponent({
        props: {
            placeholder: {
                type: String,
                default: () => "Name"
            },

        },
        components: {

        },
        data() {
            return {
                name: "",

            }
        },
        computed: {

        },
        methods: {
            add() {
                this.name && this.$emit('add', this.name)
                this.name = ''
            },

        },
    })

    </script>

<style lang="scss" scoped>

</style>
