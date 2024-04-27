<script>
import SideNavigationBar from "@/src/components/SideNavigationBar.vue";

export default {
  components: {SideNavigationBar},
  data() {
    return {};
  },
  mounted() {

  },
  methods: {}
};
</script>

<template>
  <div class="w-full h-full flex flex-row">
    <SideNavigationBar></SideNavigationBar>
    <div class="flex flex-col w-full">
      <div
          class="flex flex-row items-center pl-[10px] w-full h-[50px] ml-[2px] bg-[#F4F5FA] text-[#000000] text-[20px] font-['SYST']">
        star和lemon的小站：后台管理系统
      </div>
      <div class="w-full h-full">
        <div class="w-[50px] bg-[#FFFFFF] h-full ml-[2px] mt-[2px]">
          <div class="w-full flex flex-col items-center">
            <img alt="照片" class="w-[30px] my-[10px]" src="/static/svg/照片.svg"/>
            <img alt="相册" class="w-[30px] my-[10px]" src="/static/svg/相册.svg"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
