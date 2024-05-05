<script setup>

</script>

<template>
  <div class="w-full h-full flex flex-row">
    <SideNavigationBar></SideNavigationBar>
    <div class="flex flex-col w-full">
      <div
          class="flex flex-row items-center pl-[10px] w-full h-[50px] ml-[2px] bg-[#F4F5FA] text-[#000000] text-[20px] font-['SYST']">
        star和lemon的小站：后台管理系统
      </div>
      <router-view></router-view>
    </div>
  </div>
</template>

<style scoped>

</style>