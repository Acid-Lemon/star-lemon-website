<script>
import NavigationBar from '@/src/components/navigation-bar.vue'
import Copyright from '@/src/components/copyright.vue'

import el_locale_zh_cn from 'element-plus/es/locale/lang/zh-cn'

import {use_user_info_store} from "./stores/userInfo";
import AIAssistant from "./components/ai-assistant.vue";
import snowflake from "@/src/components/snowflake.vue";

export default {
    data() {
        return {
            show: this.$route?.meta?.show,
            el_locale: el_locale_zh_cn,
            snowflakes: []
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
        snowflake,
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
    <iframe class="fixed left-1 bottom-1" height=52
            src="//music.163.com/outchain/player?type=0&id=13381784307&auto=1&height=32" width=298></iframe>
</template>

<style>
@import "/static/css/font.css";
</style>
