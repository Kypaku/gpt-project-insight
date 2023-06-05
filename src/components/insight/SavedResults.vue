<template>
    <Accordeon class="saved-results" title="Saved results">
        <List :items="results">
            <template #default="{item, index}">
                <div class="saved-result">
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
                results: [],
            }
        },
        computed: {

        },
        methods: {

        },
        created() {
            getFilesFull(ROOT_DIR + '/data/').forEach((file) => {
                if (getBasename(file).startsWith('result_')) {
                    const content = readFileJSON(file)
                    if (content && content.dir === this.dir) {
                        this.results.push({ ...content, name: getBasename(file), date: getFileDate(file).toLocaleString() })
                    }
                }
            })
        }
    })

    </script>

<style lang="scss" scoped>

</style>
