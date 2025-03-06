<script>

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
            website_name: import.meta.env.VITE_WEBSITE_NAME,
            pages: [],
        }
    },
    computed: {},
    methods: {}
}
</script>

<template>
    <div class="bg-blue-500 flex flex-row items-center justify-between pl-[10px] w-full h-[5vh] shadow-md px-[10px]">
        <router-link to="/admin">
            <div class="text-[#FFFFFF] text-[20px] font-['SYST'] font-semibold duration-700 hover:text-[#44cef6]">
                {{ website_name }}：后台管理系统
            </div>
        </router-link>
        <router-link to="/">
            <div class="flex flex-row items-center hover:text-[#44cef6] text-[#FFFFFF] duration-700">
                <i class="ri-user-line ri-xl"/>
                <div class="md:block hidden m-[0.5vh] font-['SYST']">
                    用户
                </div>
            </div>
        </router-link>
    </div>
    <div class="w-full h-[95vh] flex flex-row">
        <div class="bg-blue-100 shadow-md w-[150px] py-[10px]">
            <div class="w-full flex flex-col items-center">
                <div v-for="page in pages" class="m-[1vh]">
                    <router-link :to="page.link"
                                 class="flex flex-row items-center relative hover:text-[#44cef6] duration-700">
                        <i :class="page.svg" class="ri-xl"/>
                        <span
                            class="md:block hidden  m-[0.5vh] font-['SYST'] font-semibold">{{
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
