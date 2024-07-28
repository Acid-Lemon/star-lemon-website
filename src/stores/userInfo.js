import {defineStore} from 'pinia'
import {get_user} from "@/src/utils/user_info";

export const useUserInfoStore = defineStore('userInfoState', {
    state: () => ({
        userInfo: {}
    }),
    actions: {
        init() {
            let user = get_user();
            this.userInfo = user ?? null;
            console.log("pinia(userInfo)初始化成功");
        }
    },
})
