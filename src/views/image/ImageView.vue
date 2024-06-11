<script>

export default {
  data() {
    return {
      images: [
        {
          imgUrl: "/static/background/1.jpg",
          time: "2021-12-12",
        },
        {
          imgUrl: "/static/background/2.jpg",
          time: "2021-12-12",
        },
        {
          imgUrl: "/static/background/3.jpg",
          time: "2021-12-12"
        },
        {
          imgUrl: "/static/background/4.jpg",
          time: "2021-12-12"
        },
        {
          imgUrl: "/static/background/5.jpg",
          time: "2021-12-12"
        },
        {
          imgUrl: "/static/background/6.jpg",
          time: "2021-12-12"
        },
        {
          imgUrl: "/static/background/7.jpg",
          time: "2021-12-12"
        },
        {
          imgUrl: "/static/background/8.jpg",
          time: "2021-12-12"
        },
        {
          imgUrl: "/static/background/9.jpg",
          time: "2021-12-12"
        },
        {
          imgUrl: "/static/background/10.jpg",
          time: "2021-12-12"
        }
      ],
      search_content: ""
    };
  },
};
</script>

<template>
  <div class="w-full h-full flex flex-col overflow-y-hidden">
    <div class="h-[10%] w-full"></div>
    <div class="w-full h-[90%] flex flex-row">
      <div class="w-full h-full flex flex-col p-[20px]">
        <div class="mb-[20px]">
          <el-input v-model="search_content" placeholder="Please input" style="width: 240px"/>
        </div>
        <div class="grid gap-x-4 gap-y-[20px] grid-cols-4 auto-rows-auto overflow-y-scroll">
          <div v-for="image in images" :key="image" class="shadow-md">
            <div>
              <el-image :src="image.imgUrl" class="w-full h-full" fit="cover"/>
              <span>{{ image.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
