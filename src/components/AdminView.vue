<script>
import {useWebConfigStore} from "../stores/webConfig";

export default {
  name: "AdminView",
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
            class="w-[3vh] m-[0.5vh] invert contrast-200"
            src="/static/svg/首页.svg"
            alt="首页"
        />
        <div class="md:block hidden hover:text-[#44cef6] text-[#FFFFFF] m-[0.5vh] font-['SYST'] duration-700">用户</div>
      </div>
    </router-link>
  </div>
</template>

<style scoped>

</style>