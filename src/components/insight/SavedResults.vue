<template>
    <Accordeon class="saved-results" title="Saved results">
        <input
            type="search"
            v-model="searchQuery"
            placeholder="Search files..."
            class="search-files w-full mb-2 py-2 px-2" />
        <button @click="(showAll = !showAll, updateResults())" class="underline" > {{ showAll  ? 'Only for current dir' : 'Show all' }}</button>
        <List :items="filteredResults" hideTopAdd="1">
            <template #default="{item, index}">
                <div class="saved-result cursor-pointer w-full mt-2 flex-center gap-2 justify-center" @click="$emit('select', item)">
                    <div class="saved-result__name">
                        {{item.name}}
                    </div>

                    <div class="saved-result__date">
                        {{item.date}}
                    </div>
                    <!-- <div class="saved-result__result">
                        {{item.result}}
                    </div>
                    <div class="saved-result__prompt">
                        {{item.prompt}}
                    </div> -->
                </div>
            </template>
        </List>
    </Accordeon>
</template>

<script lang='ts'>
    import { ROOT_DIR } from '@/helpers'
    import { getBasename, getFileDate, getFilesFull, readFileJSON } from '@/../helpers/node_gm'
    import { defineComponent, PropType } from 'vue'
    import Accordeon from '@/components/misc/Accordeon.vue'
    import List from '@/components/misc/list/List.vue'

    export interface IResult {
        dir: string,
        result: string,
        prompt?: string,
        name?: string,
        date?: string,
    }

    export default defineComponent({
        props: {
            dir: String,
        },
        components: {
            List,
            Accordeon,

        },
        // emits: ['update:modelValue'], this.$emit('update:modelValue', title)
        data() {
            return {
                showAll: false,
                searchQuery: '',
                results: [],
            }
        },
        computed: {
            filteredResults(): IResult[] {
                if (!this.searchQuery) return this.results
                const query = this.searchQuery.toLowerCase()
                return this.results.filter((file: IResult) => file.name.toLowerCase().includes(query))
            },
        },
        methods: {
            updateResults() {
                getFilesFull(ROOT_DIR + '/data/').forEach((file) => {
                    if (getBasename(file).startsWith('result_')) {
                        const content = readFileJSON(file)
                        if (content && (this.showAll ? true : content.dir === this.dir)) {
                            this.results.push({ ...content, name: getBasename(file), date: getFileDate(file).toLocaleString() })
                        }
                    }
                })
            }
        },
        created() {
            this.updateResults()
        }
    })

    </script>

<style lang="scss" scoped>

</style>
