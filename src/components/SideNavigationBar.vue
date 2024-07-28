<script>

export default {
  name: "SideNavigationBar",
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
    };
  },
};
</script>

<template>
  <div class="w-[150px] py-[10px] shadow-md">
    <div class="w-full flex flex-col items-center">
      <div v-for="page in pages" class="m-[1vh]">
        <router-link :to="page.link" class="flex flex-row items-center relative">
          <img
              :alt="page.name"
              :src="page.svg"
              class="w-[3vh] m-[0.5vh]"
          />
          <span class="md:block hidden hover:text-[#44cef6] m-[0.5vh] font-['SYST'] duration-700">{{ page.name }}</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>