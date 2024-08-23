import {defineStore} from 'pinia'

export const use_web_config_store = defineStore('web_config', {
    state: () => ({
        web_config: {
            web_name: null,
        }
    }),
    actions: {
        async init() {
            let web_name = "star和lemon的小站";
            this.web_config.web_name = web_name ?? null;
        }
    },
})