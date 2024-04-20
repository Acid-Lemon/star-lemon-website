<script>
import SideNavigationBar from "@/src/components/SideNavigationBar.vue";

export default {
  components: {SideNavigationBar},
  data() {
    return {
      WebName: "star和lemon的小站",
    };
  },
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
      <div class="w-full">
        <el-card style="max-width: 480px">
          <template #header>
            <div class="card-header">
              <span>网站信息</span>
            </div>
          </template>
          <span>网站名称：{{ WebName }}</span>
          <template #footer>Footer content</template>
        </el-card>

      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
