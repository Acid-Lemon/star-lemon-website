<script>
import NavigationBar from '@/src/components/NavigationBar.vue'
import Copyright from '@/src/components/Copyright.vue'

import el_locale_zh_cn from 'element-plus/es/locale/lang/zh-cn'

import {use_user_info_store} from "./stores/userInfo";

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
    methods: {},
    components: {
        NavigationBar,
        Copyright
    }
}
</script>

<template>
    <ElConfigProvider :locale="el_locale">
        <NavigationBar v-if="show?.hasOwnProperty('navigation_bar') ? show.navigation_bar: true"></NavigationBar>
        <router-view class="w-full h-full"></router-view>
        <Copyright v-if="show?.hasOwnProperty('copyright') ? show.copyright: true"></Copyright>
    </ElConfigProvider>
</template>

<style>
@import "/static/font/font.css";
</style>
