import {defineStore} from 'pinia'

export const useWebConfigStore = defineStore('webConfig', () => {
    // 其他配置...
    let web_name = "star和lemon的小站"

    return {
        web_name
    }

})