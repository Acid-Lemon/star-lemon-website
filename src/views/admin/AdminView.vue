<script>
import SideNavigationBar from "../../components/SideNavigationBar.vue";

export default {
  components: {SideNavigationBar},
  data() {
    return {};
  },
};
</script>

<template>
  <div class="w-full h-full flex flex-row">
    <div class="w-full">
      <div class="h-[50px] ml-[2px] bg-[#F4F5FA]"></div>
      <SideNavigationBar></SideNavigationBar>
    </div>
  </div>
</template>

<style scoped>

</style>
