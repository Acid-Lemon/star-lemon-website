<script>
export default {
  data() {
    return {};
  },
};
</script>

<template>
  <div class="bg-[url('/static/background/22.jpg')] w-full h-full bg-cover pt-[100px]">
    <uni-notice-bar background-color="#FFFFFF" scrollable show-icon
                    text="欢迎来到star和lemon的小站!~ 我们网站将不断迭代, 为大家提供更多功能, 让大家在这个互联网的时代, 体验到更多科技带来的便捷与乐趣!"/>
    <el-carousel height="150px" trigger="click">
      <el-carousel-item v-for="item in 4" :key="item">
        <h3 class="small justify-center">{{ item }}</h3>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<style scoped>
</style>
