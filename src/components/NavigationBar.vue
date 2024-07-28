<script>
import {useUserInfoStore} from "../stores/userInfo";

export default {
  name: "NavigationBar",
  beforeMount() {
    this.updatePages();
  },
  data() {
    return {
      pages: [],
      hoveredPage: null,
      hoveredTimeout: null,
      isHoveredSecondary: false,
    };
  },
  mounted() {
  },
  computed: {
    // 过滤掉登录和用户信息页面
    // 如果用户已经登录，则过滤掉登录页面
    // 如果用户未登录，则过滤掉用户信息页面 & 管理页面
    filteredPages() {
      return this.pages.filter(page => {
        const loginMatch = !(page.name === "登录" && this.isLogin);
        const userMatch = !(page.name === "个人" && !this.isLogin);
        const adminMatch = !(page.name === "管理" && !this.isLogin);
        return loginMatch && userMatch && adminMatch;
      });
    },
    isLogin() {
      const userInfoStore = useUserInfoStore();
      return !!userInfoStore;
    },
  },
  methods: {
    // 更新导航栏
    updatePages() {
      let routes = this.$router.options.routes;
      let select_pages = [];
      routes.map(e => {
        if (!e?.meta?.navigation_bar) {
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
      this.hoveredPage = page;
      // 清除光标移出导航标签回调函数
      clearTimeout(this.hoveredTimeout);
    },
    // 光标移出导航标签时触发
    onMouseLeave() {
      this.hoveredTimeout = setTimeout(() => {
        if (!this.isHoveredSecondary) {
          this.hoveredPage = null;
        }
      }, 300); // 延迟300ms
    },
    // 鼠标移入二级菜单时触发
    onSecondaryMouseEnter() {
      // 清除光标移出导航标签回调函数
      clearTimeout(this.hoveredTimeout);
      // 光标在二级菜单上时
      this.isHoveredSecondary = true;
    },
    // 鼠标移出二级菜单时触发
    onSecondaryMouseLeave() {
      this.isHoveredSecondary = false;
      this.hoveredTimeout = setTimeout(() => {
        this.hoveredPage = null;
      }, 300); // 延迟300ms
    },
    loginOut(){
      // 清除本地存储
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // 更新用户状态
      const userInfoState = useUserInfoStore();
      userInfoState.userInfo = {};
      // 更新导航栏
      this.updatePages();
      // 如果目前在个人页，则跳转到登录页
      if(this.$route.path === "/user"){
        this.$router.push("/login");
      }
    }
  },
};
</script>

<template>
  <div class="fixed top-[1.5vw] left-[1.5vw] w-[97vw] h-[50px] hover:bg-white hover:bg-opacity-50 duration-700 rounded-md flex flex-row justify-between items-center p-[3vh] z-[1000]">
    <router-link to="/">
      <span class="md:text-[26px] text-[20px] font-['ZKXW'] hover:text-[#44cef6] duration-700">star和lemon的小站</span>
    </router-link>
    <div class="flex flex-row justify-center items-center">
      <div v-for="page in filteredPages" class="m-[1vh] flex flex-col items-center" @mouseenter="onMouseEnter(page)" @mouseleave="onMouseLeave">
        <router-link :to="page.link" class="flex flex-row items-center relative">
          <img
              class="w-[3vh] m-[0.5vh]"
              :src="page.svg"
              :alt="page.name"
          />
          <span class="md:block hidden hover:text-[#44cef6] m-[0.5vh] font-['SYST'] duration-700">{{ page.name }}</span>
        </router-link>
        <div v-show="page.name === '个人' && hoveredPage === page" class="absolute flex flex-col items-center justify-center bottom-[-5vh] w-[10vh] h-[4vh] bg-[#FFFFFF] bg-opacity-50 rounded shadow-md duration-700" @mouseenter="onSecondaryMouseEnter" @mouseleave="onSecondaryMouseLeave" @click="loginOut">
          取消登录
        </div>
        <div v-show="page.name === '文章' && hoveredPage === page" class="absolute flex flex-col items-center justify-center bottom-[-5vh] w-[10vh] h-[4vh] bg-[#FFFFFF] bg-opacity-50 rounded shadow-md duration-700" @mouseenter="onSecondaryMouseEnter" @mouseleave="onSecondaryMouseLeave">
          一件小事
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
