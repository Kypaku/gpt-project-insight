<template>
    <div class="input-textarea p-0">
        <label :for="id" class="mr-2" v-if="label">{{label}}</label>
        <textarea
            type="text"
            class="border-2 rounded p-1"
            ref="input"
            :id="id"
            :value="value"
            v-bind="$attrs"
            :placeholder="placeholder"
            @keydown.tab.exact.prevent="suggestions && suggest(suggestionsFiltered[0])"
            @keypress.enter="$emit('end')"
            @input="ev => $emit('update:value', ev?.target?.value)"/>
        <div class="suggestions suggestions-action cursor-pointer flex flex-wrap justify-center mt-1" v-if="false">
            <div class="dummy">Dummy</div>
            <div
                class="suggestion mr-2 text-sm"
                v-for="(item, i) in suggestionsFiltered.slice(0, 7)"
                :class="{first: !i}"
                :key="i"
                @click="$emit('update:value', item.value)">
                {{item.name}}
            </div>
        </div>
    </div>
</template>

<script lang='ts'>
    import { localeIncludes, localeStart } from "@/../helpers/node_gm"
    import { defineComponent, PropType } from "vue"

    export interface InputTextSuggestion {
        name: string
        value: string
    }

    export default defineComponent({
        props: {

            placeholder: String,
            label: String,
            value: String,
            suggestions: Object as PropType<InputTextSuggestion[]>,
        },
        components: {

        },
        data() {
            return {
                id: "input-text" + +new Date()
            }
        },
        computed: {
            suggestionsFiltered() {
                if (!this.suggestions) return []
                const byStart = this.suggestions.filter((el) => this.value ? localeStart(el.name, this.value) : true)
                const byInclude = this.suggestions.filter((el) => this.value ? localeIncludes(el.name, this.value) : true)
                return [...byStart, ...byInclude]
            },
        },
        methods: {
            suggest(suggestion: InputTextSuggestion) {
                this.$emit("update:value", suggestion.value)
                this.$emit("suggest", suggestion)
            },
        },

        mounted () {
            this.$emit("mounted", this.$refs.input)
        },
    })

    </script>

<style lang="scss" scoped>
    .first{
        font-weight: 700;
    }
    .suggestion{

    }
    .dummy{
        opacity: 0;
    }
</style>
