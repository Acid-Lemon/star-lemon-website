<script>
import {use_user_info_store} from "../stores/userInfo";
import {use_web_config_store} from "../stores/webConfig";

export default {
    name: "NavigationBar",
    beforeMount() {
        this.updatePages();
    },
    data() {
        return {
            pages: [],
            hovered_page: null,
            hovered_timeout: null,
            is_hovered_secondary: false,
        };
    },
    mounted() {
    },
    computed: {
        is_login() {
            const user_info_store = use_user_info_store();
            return !!user_info_store.user_info;
        },
        web_config() {
            const web_config_store = use_web_config_store();
            return web_config_store.web_config;
        },
        user_info() {
            const user_info_store = use_user_info_store();
            return user_info_store.user_info;
        }
    },
    watch: {
        is_login: {
            handler() {
                this.updatePages();
            },
            deep: true
        }
    },
    methods: {
        // 更新导航栏
        updatePages() {
            let routes = this.$router.options.routes;
            let select_pages = [];
            routes.map(e => {
                if (!e?.meta?.navigation_bar) {
                    return;
                } else if (e.path === "/login" && this.is_login) {
                    // 如果用户已经登录，则过滤掉登录页面
                    return;
                } else if (e.path === "/user" && !this.is_login) {
                    // 如果用户未登录，则过滤掉用户信息页面
                    return;
                } else if (e.path === "/admin" && this.user_info?.role !== "admin") {
                    // 如果用户不是管理员，则过滤掉管理页面
                    return;
                }

                select_pages.push({
                    ...e.meta.navigation_bar,
                    link: e.path
                });
            });

            this.pages = select_pages;
        },
        // 光标移入导航标签时触发
        onMouseEnter(page) {
            this.hovered_page = page;
            // 清除光标移出导航标签回调函数
            clearTimeout(this.hovered_timeout);
        },
        // 光标移出导航标签时触发
        onMouseLeave() {
            this.hovered_timeout = setTimeout(() => {
                if (!this.is_hovered_secondary) {
                    this.hovered_page = null;
                }
            }, 300); // 延迟300ms
        },
        // 鼠标移入二级菜单时触发
        onSecondaryMouseEnter() {
            // 清除光标移出导航标签回调函数
            clearTimeout(this.hovered_timeout);
            // 光标在二级菜单上时
            this.is_hovered_secondary = true;
        },
        // 鼠标移出二级菜单时触发
        onSecondaryMouseLeave() {
            this.is_hovered_secondary = false;
            this.hovered_timeout = setTimeout(() => {
                this.hovered_page = null;
            }, 300); // 延迟300ms
        },
        loginOut() {
            // 清除本地存储
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // 更新用户状态
            const user_info_store = use_user_info_store();
            user_info_store.user_info = null;
            // 更新导航栏
            this.updatePages();
            // 如果目前在个人页，则跳转到登录页
            if (this.$route.path === "/user") {
                this.$router.push("/login");
            }
        }
    },
};
</script>

<template>
    <div
        class="fixed top-[1.5vw] left-[1.5vw] w-[97vw] md:h-[50px] h-[80px] hover:bg-white hover:backdrop-blur-md hover:bg-opacity-50 duration-700 rounded-md flex md:flex-row flex-col md:justify-between items-center justify-center md:p-[3vh] z-[1000]">
        <div class="flex flex-row justify-center items-center">
            <router-link to="/">
                <div
                    class="md:text-[22px] text-[20px] md:m-[0.5vh] mt-[0.5vh] font-['SYST'] font-semibold hover:text-[#44cef6] duration-700">
                    {{ web_config?.web_name }}
                </div>
            </router-link>
        </div>
        <div class="flex flex-row justify-center items-center">
            <div v-for="page in pages" class="m-[1vh] flex flex-col items-center"
                 @mouseenter="onMouseEnter(page)"
                 @mouseleave="onMouseLeave">
                <router-link :to="page.link" class="flex flex-row items-center relative">
                    <img
                        :alt="page.name"
                        :src="page.svg"
                        class="w-[3vh] md:m-[0.5vh] mb-[0.5vh]"
                    />
                    <span
                        class="md:block hidden hover:text-[#44cef6] md:m-[0.5vh] mb-[0.5vh]  font-['SYST'] duration-700">
                        {{ page.name }}
                    </span>
                </router-link>
                <div v-show="page.name === '个人' && hovered_page === page"
                     class="absolute flex flex-col items-center justify-center top-[7vh] w-[10vh] bg-[#FFFFFF] bg-opacity-50 rounded shadow-md duration-700"
                     @mouseenter="onSecondaryMouseEnter" @mouseleave="onSecondaryMouseLeave">
                    <div class="h-[4vh] flex flex-row items-center justify-center font-['SYST']"
                         @click="loginOut">
                        取消登录
                    </div>
                </div>
                <div v-show="page.name === '文章' && hovered_page === page"
                     class="absolute flex flex-col items-center justify-center top-[7vh] w-[10vh] bg-[#FFFFFF] bg-opacity-50 rounded shadow-md duration-700"
                     @mouseenter="onSecondaryMouseEnter" @mouseleave="onSecondaryMouseLeave">
                    <div class="h-[4vh] flex flex-row items-center justify-center font-['SYST']"
                         @click="this.$router.push('/article?type=note')">笔记
                    </div>
                    <div class="h-[4vh] flex flex-row items-center justify-center font-['SYST']"
                         @click="this.$router.push('/article?type=diary')">日记
                    </div>
                    <div class="h-[4vh] flex flex-row items-center justify-center font-['SYST']"
                         @click="this.$router.push('/article?type=sentence')">句子
                    </div>
                    <div class="h-[4vh] flex flex-row items-center justify-center font-['SYST']"
                         @click="this.$router.push('/article?type=other')">其它
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>
