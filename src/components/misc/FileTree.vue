<template>
    <ul :class="'ml-' + 2 * level" class="flex flex-col items-start" >
        <li v-for="item in items" :key="item.fullPath"  class="flex flex-col items-start" :class="item.children && 'mb-2'">
            <div class="item flex-center gap-2" :title="item.path">
                <input class="mr-2" :checked="value === null || value.includes(item.path) || checked" type="checkbox" @change="onSelect(item)" />
                <span >{{ item.name + (item.children ? "/" : "") }}</span>
            </div>
            <template v-if="item.children">
                <file-tree :items="item.children" @select="onSelect" :level="level + 1" :checked="value === null || value.includes(item.path) || checked"/>
            </template>
        </li>
    </ul>
</template>

  <script lang="ts">
    import { NestedFile } from 'helpers'
    import { PropType } from 'vue'

    export default {
        name: 'FileTree',
        props: {
            checked: {
                type: Boolean,
                default: () => false
            },
            level: {
                type: Number,
                default: () => 0
            },
            items: {
                type: Array as PropType<NestedFile[]>,
                default: () => [],
            },
            value: {
                type: Array as PropType<string[]>,
                default: () => null,
            },
        },
        methods: {
            onSelect(item) {
                this.$emit('update:value', item.path)
            },
        },
    }
  </script>
