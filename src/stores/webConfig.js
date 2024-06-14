import {defineStore} from 'pinia'

export const useWebConfigStore = defineStore('webConfig', () => {
    // 其他配置...
    let webName = "star和lemon的小站"

    return {
        webName
    }

})