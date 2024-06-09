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
        }
      ],
    };
  },
};
</script>

<template>
  <div class="w-full h-full flex flex-row p-[20px]">
    <div class="grid gap-x-4 gap-y-[20px] grid-cols-4 auto-rows-auto">
      <div v-for="image in images" :key="image" class="shadow-md">
        <div>
          <el-image :src="image.imgUrl" class="w-full h-full" fit="cover"/>
          <span>{{ image.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
