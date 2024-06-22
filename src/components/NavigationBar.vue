<script>
import { useLoginStateStore } from '../stores/loginState'

export default {
  name: "NavigationBar",
  beforeMount() {
    this.updatePages();
  },
  mounted() {
    window.addEventListener('storage', this.onStorageChange);
  },
  beforeDestroy() {
    window.removeEventListener('storage', this.onStorageChange);
  },
  data() {
    return {
      pages: [],
      hoveredPage: null,
      hoveredTimeout: null,
      isHoveredSecondary: false,
    };
  },
  computed: {
    filteredPages() {
      return this.pages.filter(page => {
        const loginMatch = !(page.name === "登录" && localStorage.getItem("token"));
        const userMatch = !(page.name === "个人" && !localStorage.getItem("token"));
        return loginMatch && userMatch;
      });
    },loginState() {
      const loginStateStore = useLoginStateStore();
      return loginStateStore.loginState;
    },
    currentRoute() {
      return this.$route.path;
    }
  },
  methods: {
    updatePages() {
      let routes = this.$router.options.routes;
      let select_pages = [];
      routes.map(e => {
        if (!e?.meta?.navigation_bar) {
          return;
        }

        if (e.login !== undefined) {
          let is_login = !!localStorage.getItem("token")?.length;
          if (is_login !== e.login) {
            return;
          }
        }

        select_pages.push({
          ...e.meta.navigation_bar,
          link: e.path
        });
      });

      this.pages = select_pages;
    },
    onStorageChange(event) {
      if (event.key === 'token') {
        this.updatePages();
      }
    },
    onMouseEnter(page) {
      this.hoveredPage = page;
    },
    onMouseLeave() {
      this.hoveredTimeout = setTimeout(() => {
        if (!this.isHoveredSecondary) {
          this.hoveredPage = null;
        }
      }, 300); // 延迟300ms
    },
    onSecondaryMouseEnter() {
      clearTimeout(this.hoveredTimeout);
      this.isHoveredSecondary = true;
    },
    onSecondaryMouseLeave() {
      this.isHoveredSecondary = false;
      this.hoveredTimeout = setTimeout(() => {
        this.hoveredPage = null;
      }, 300); // 延迟300ms
    },
    loginOut(){
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.updatePages();
      if(this.$route.path === "/user"){
        this.$router.push("/login");
      }
    }
  },
  watch: {
    token() {
      this.updatePages();
    },
    loginState() {
      this.updatePages();
    }
  }
};
</script>

<template>
  <div
      class="fixed top-[2.5%] left-[2.5%] w-[95%] md:h-[50px] h-[50px] hover:bg-white hover:bg-opacity-50 duration-700 rounded-md flex flex-row justify-between items-center p-[3vh] z-[1000]">
    <router-link to="/">
      <span class="md:text-[26px] text-[20px] font-['ZKXW'] hover:text-[#44cef6] duration-700">star和lemon的小站</span>
    </router-link>
    <div class="flex flex-row justify-center items-center">
      <div v-for="page in filteredPages" class="m-[1vh] flex flex-col items-center" @mouseenter="onMouseEnter(page)"
           @mouseleave="onMouseLeave">
        <router-link :to="page.link" class="flex flex-row items-center relative">
          <img
              class="w-[3vh] m-[0.5vh]"
              :src="page.svg"
              :alt="page.name"
          />
          <span class="md:block hidden hover:text-[#44cef6] m-[0.5vh] font-['SYST'] duration-700">{{ page.name }}</span>
        </router-link>
        <div v-show="page.name === '个人' && hoveredPage === page" class="absolute flex flex-col items-center justify-center bottom-[-5vh] w-[10vh] h-[4vh] bg-[#FFFFFF] bg-opacity-50 rounded shadow-md duration-700" @mouseenter="onSecondaryMouseEnter"
             @mouseleave="onSecondaryMouseLeave" @click="loginOut">
          取消登录
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
