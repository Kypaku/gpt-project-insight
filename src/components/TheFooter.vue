<template>
    <div class="footer flex items-center mt-6 px-2 py-1">
        <button class="p-1 bg-gray-200 mr-2 rounded" @click="reload">Reload</button>
        <button class="p-1 bg-gray-200 mr-2 rounded" @click="openLink('https://platform.openai.com/account/usage')">OpenAI Page</button>
        <button class="p-1 bg-gray-200 mr-2 rounded" @click="openLink('https://github.com/Kypaku/gpt-files-documentation')">Repo</button>
        <button class="p-1 bg-gray-200 mr-2 rounded" @click="clearCache">Clear Cache</button>
        <button class="p-1 bg-gray-200 mr-2 rounded" @click="openDevTools">Open Dev Tools</button>
    </div>
</template>

<script lang='ts'>
    import { defineComponent, PropType } from 'vue'
    import ls from 'local-storage'
    import { remote, shell } from 'electron'

    export default defineComponent({
        props: {

        },
        components: {

        },
        data() {
            return {
                shell
            }
        },
        computed: {

        },
        methods: {
            openDevTools() {
                remote.getCurrentWindow().webContents.toggleDevTools()
            },

            clearCache() {
                ls("dir", "")
                ls("apiKey", "")
                ls("excludes", "")
                ls("settings", "")
                ls("tab", "")
            },
            openLink(path: string) {
                shell.openExternal(path.replaceAll('&amp;', '&'))
            },
            reload() {
                location.reload()
            },
        },
    })

    </script>

<style lang="scss" scoped>

</style>
