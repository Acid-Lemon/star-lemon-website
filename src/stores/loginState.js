import {defineStore} from 'pinia'

export const useLoginStateStore = defineStore('loginState', {
    // 其他配置...
    state: () => ({
        loginState: false,
    }), actions: {
        changeLoginState() {
            this.loginState = !this.loginState;
        },
    },

})