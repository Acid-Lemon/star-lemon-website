import {defineStore} from 'pinia'
import {get_user} from "@/src/utils/user_info";

export const use_user_info_store = defineStore('user_info_state', {
    state: () => ({
        user_info: null
    }),
    actions: {
        init() {
            let user = get_user();
            this.user_info = user ?? null;
            console.log("pinia(user_info)初始化成功");
        }
    },
})
