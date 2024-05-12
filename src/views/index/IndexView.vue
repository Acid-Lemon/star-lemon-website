<script>
export default {
  data() {
    return {
      pictureUrl: [
        "/static/picture/IMG_0074.JPG",
        "/static/picture/IMG_0075.JPG",
        "/static/picture/IMG_0074.JPG",
      ]
    };
  },
};
</script>

<template>
  <div class="bg-[url('/static/background/22.jpg')] w-full h-full bg-cover pt-[100px]">
    <uni-notice-bar background-color="#FFFFFF" scrollable show-icon
                    text="欢迎来到star和lemon的小站!~ 我们网站将不断迭代, 为大家提供更多功能, 让大家在这个互联网的时代, 体验到更多科技带来的便捷与乐趣!"/>
    <div class="w-[500px] ml-[20px] mt-[20px]">
      <el-carousel height="300px" trigger="click">
        <el-carousel-item v-for="picture in pictureUrl" :key="picture">
          <el-image :src="picture"/>
        </el-carousel-item>
      </el-carousel>
    </div>
  </div>
</template>

<style scoped>
</style>
