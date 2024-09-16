import {defineStore} from 'pinia'

export const use_web_config_store = defineStore('web_config', {
    state: () => ({
        web_config: {
            web_name: "star和lemon的小站",
        }
    }),
})