<script>
export default {
  name: "NavigationBar",
  beforeMount() {
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
  data() {
    return {
      pages: [],
    };
  },
};
</script>

<template>
  <div
      class="fixed top-[2.5%] left-[2.5%] w-[95%] md:h-[50px] h-[50px] hover:bg-white hover:bg-opacity-50 duration-700 rounded-md flex flex-row justify-between items-center p-[3vh]">
    <router-link to="/">
      <span class="md:text-[26px] text-[20px] font-['ZKXW'] hover:text-[#44cef6] duration-700">star和lemon的小站</span>
    </router-link>
    <div class="flex flex-row justify-center items-center">
      <div v-for="page in pages" class="m-[1vh]">
        <router-link :to="page.link" class="flex flex-row items-center">
          <img
              class="w-[3vh] m-[0.5vh]"
              :src="page.svg"
              :alt="page.name"
          />
          <span class="md:block hidden hover:text-[#44cef6] m-[0.5vh] font-['SYST'] duration-700">{{ page.name }}</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
