<script>
import {useWebConfigStore} from "../stores/webConfig";

export default {
    name: "AdminView",
    beforeMount() {
        let routes = this.$router.options.routes;
        let select_pages = [];
        routes.map(e => {
            if (!e?.meta?.side_navigation_bar) {
                return;
            }

            select_pages.push({
                ...e.meta.side_navigation_bar,
                link: e.path
            });
        });

        this.pages = select_pages;
    },
    data() {
        return {
            pages: [],
        }
    },
    methods: {useWebConfigStore}
}
</script>

<template>
    <div class="bg-blue-500 flex flex-row items-center justify-between pl-[10px] w-full h-[5vh] shadow-md px-[10px]">
        <router-link to="/admin">
            <div class="text-[#FFFFFF] text-[20px] font-['SYST'] duration-700 hover:text-[#44cef6]">
                {{ useWebConfigStore().web_name }}：后台管理系统
            </div>
        </router-link>
        <router-link to="/">
            <div class="flex flex-row items-center">
                <img
                    alt="首页"
                    class="w-[3vh] m-[0.5vh] invert contrast-200"
                    src="/static/svg/首页.svg"
                />
                <div class="md:block hidden hover:text-[#44cef6] text-[#FFFFFF] m-[0.5vh] font-['SYST'] duration-700">
                    用户
                </div>
            </div>
        </router-link>
    </div>
    <div class="w-full h-[95vh] flex flex-row">
        <div class="bg-blue-100 shadow-md w-[150px] py-[10px]">
            <div class="w-full flex flex-col items-center">
                <div v-for="page in pages" class="m-[1vh]">
                    <router-link :to="page.link" class="flex flex-row items-center relative">
                        <img
                            :alt="page.name"
                            :src="page.svg"
                            class="w-[3vh] m-[0.5vh]"
                        />
                        <span class="md:block hidden hover:text-[#44cef6] m-[0.5vh] font-['SYST'] duration-700">{{
                                page.name
                            }}</span>
                    </router-link>
                </div>
            </div>
        </div>
        <slot></slot>
    </div>
</template>

<style scoped>

</style>