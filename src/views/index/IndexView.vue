<script>

export default {
  data() {
    return {
      picture_url: [
        "/static/picture/1.jpg",
        "/static/picture/2.jpg"
      ],
    };
  },
  mounted() {
  },
  methods: {
  }
};
</script>

<template>
  <div class="bg-[url('/static/background/22.jpg')] bg-cover bg-center w-full h-full pt-[100px]">
    <div class="flex flex-col">
      <uni-notice-bar background-color="#FFFFFF" scrollable show-icon
                      text="欢迎来到star和lemon的小站!~ 我们网站将不断迭代, 为大家提供更多功能, 让大家在这个互联网的时代, 体验到更多科技带来的便捷与乐趣!"/>
      <div class="flex flex-row mt-[20px]">
        <div class="flex flex-col">
          <div class="md:w-[500px] w-[90vw] md:h-[280px] h-[50vw] md:ml-[20px] ml-[5vw]">
            <el-carousel trigger="click" motion-blur>
              <el-carousel-item v-for="picture in picture_url" :key="picture">
                <el-image :src="picture" fit="cover"/>
              </el-carousel-item>
            </el-carousel>
          </div>
          <div class="w-[500px] ml-[20px] mt-[20px]">
          </div>
        </div>
        <div></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .el-carousel {
    height: 100%;
  }
</style>
