<script>
import NavigationBar from '@/src/components/navigation-bar.vue'
import Copyright from '@/src/components/copyright.vue'

import el_locale_zh_cn from 'element-plus/es/locale/lang/zh-cn'

import {use_user_info_store} from "./stores/userInfo";
import AIAssistant from "./components/ai-assistant.vue";

export default {
    data() {
        return {
            show: this.$route?.meta?.show,
            el_locale: el_locale_zh_cn
        };
    },
    onLoad() {
        this.$watch("$route", (to, _from) => {
            this.show = to?.meta?.show;
        });

        use_user_info_store().init();
    },
    computed: {
        user_info() {
            const user_info_store = use_user_info_store();
            return user_info_store.user_info;
        },
    },
    methods: {},
    components: {
        NavigationBar,
        Copyright,
        AIAssistant
    }
}
</script>

<template>
    <ElConfigProvider :locale="el_locale">
        <NavigationBar v-if="show?.hasOwnProperty('navigation_bar') ? show.navigation_bar : true"></NavigationBar>
        <router-view class="w-full h-full"></router-view>
        <Copyright v-if="show?.hasOwnProperty('copyright') ? show.copyright: true"></Copyright>
        <AIAssistant v-if="user_info"/>
    </ElConfigProvider>
</template>

<style>
@import "/static/font/font.css";
</style>
