<script>

export default {
  data() {
    return {
      pictureUrl: [
        "/static/picture/1.jpg",
        "/static/picture/2.jpg"
      ],
      NetworkState: null,
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
          <div class="w-[500px] height-[280px] ml-[20px]">
            <el-carousel height="280px" trigger="click" :motion-blur=true>
              <el-carousel-item v-for="picture in pictureUrl" :key="picture">
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
</style>
