<script>
import {useWebConfigStore} from "../stores/webConfig";

export default {
  name: "AdminView",
  methods: {useWebConfigStore}
}
</script>

<template>
  <div class="flex flex-row items-center pl-[10px] w-full h-[50px] shadow-md">
    <router-link to="/admin">
  <span
      class="text-[#000000] text-[20px] font-['SYST'] duration-700 hover:text-[#44cef6]">
    {{ useWebConfigStore().webName }}：后台管理系统
  </span>
    </router-link>
  </div>
</template>

<style scoped>

</style>