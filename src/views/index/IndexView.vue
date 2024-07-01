<script>

import {useNetwork} from "vue-hooks-plus";

export default {
  data() {
    return {
      pictureUrl: [
        "/static/picture/IMG_0074.JPG",
        "/static/picture/IMG_0075.JPG",
        "/static/picture/IMG_0074.JPG",
      ],
      NetworkState: null,
    };
  },
  async mounted() {
    await this.get_network_status()
  },
  methods: {
    async get_network_status() {
      this.NetworkState = useNetwork();
    },
  }
};
</script>

<template>
  <div class="bg-[url('/static/background/23.jpg')] w-full h-full bg-cover pt-[100px]">
    <div class="flex flex-col">
      <uni-notice-bar background-color="#FFFFFF" scrollable show-icon
                      text="欢迎来到star和lemon的小站!~ 我们网站将不断迭代, 为大家提供更多功能, 让大家在这个互联网的时代, 体验到更多科技带来的便捷与乐趣!"/>
      <div class="flex flex-row mt-[20px]">
        <div class="flex flex-col">
          <div class="w-[500px] ml-[20px]">
            <el-carousel height="300px" trigger="click">
              <el-carousel-item v-for="picture in pictureUrl" :key="picture">
                <el-image :src="picture"/>
              </el-carousel-item>
            </el-carousel>
          </div>
          <div class="w-[500px] ml-[20px] mt-[20px]">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>网络状态</span>
                </div>
              </template>
              <div>网络状态：{{ NetworkState?.online ? "在线" : "离线" }}</div>
              <div>往返时延：{{ NetworkState?.rtt }} ms</div>
              <div>网络类型：{{ NetworkState?.effectiveType }}</div>
              <div>下行速度：{{ NetworkState?.downlink / 8 }} MB/s</div>
              <template #footer></template>
            </el-card>
          </div>
        </div>
        <div></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
