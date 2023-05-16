import { ComponentOptionsBase, ComponentPublicInstance } from "vue"
import ls from 'local-storage'

function getQueryParams(url) {
    const params = {}
    const queryString = url.split("?")[1]
    if (!queryString) {
        return params
    }
    const keyValuePairs = queryString.split("&")
    keyValuePairs.forEach(keyValuePair => {
        const [key, value] = keyValuePair.split("=")
        params[key] = decodeURIComponent(value)
    })
    return params
}

export async function handleExternalRoutes(app: ComponentPublicInstance<{}, {}, {}, {}, {}, {}, {}, {}, false, ComponentOptionsBase<any, any, any, any, any, any, any, any, any, {}, {}, string>, {}>, route: string) {
    const path = route.replace('gptpi://', '')
    const parts = path.split('/')
    const params = getQueryParams(path) as any
    if (params.dir) {
        ls("dir", params.dir);
        (app.$root as any).dir = params.dir
        location.reload()
    }
    if ((params.result && app.$root.$refs?.tabInsight as any)?.loadResult) {
        (app.$root.$refs.tabInsight as any).loadResult(params.result)
    }
}
