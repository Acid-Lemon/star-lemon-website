import {defineStore} from 'pinia'
import {get_user} from "@/src/utils/user_info";

export const use_user_info_store = defineStore('user_info', {
    state: () => ({
        user_info: null
    }),
    actions: {
        async init() {
            let user = await get_user();
            this.user_info = user ?? null;
        }
    },
})
