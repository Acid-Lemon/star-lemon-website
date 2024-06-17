<script>

import {date_format} from "../../utils/time";

export default {
  name: "ImageView",
  data() {
    return {
      images: [
        {
          imgUrl: "/static/background/1.jpg",
          id: "1",
          time: 1718640810456
        },
        {
          imgUrl: "/static/background/2.jpg",
          id: "2",
          time: 1718640810456
        },
        {
          imgUrl: "/static/background/3.jpg",
          id: "3",
          time: 1718640810456
        },
        {
          imgUrl: "/static/background/4.jpg",
          id: "4",
          time: 1638547200000
        },
        {
          imgUrl: "/static/background/5.jpg",
          id: "5",
          time: 1638547200000
        },
        {
          imgUrl: "/static/background/6.jpg",
          id: "6",
          time: 1638547200000
        },
        {
          imgUrl: "/static/background/7.jpg",
          id: "7",
          time: 1638547200000
        },
        {
          imgUrl: "/static/background/8.jpg",
          id: "8",
          time: 1638547200000
        },
        {
          imgUrl: "/static/background/9.jpg",
          id: "9",
          time: 1638547200000
        },
        {
          imgUrl: "/static/background/10.jpg",
          id: "10",
          time: 1718639386000
        }
      ],
      search_content: "",
      date_range: null,
    };
  },
  mounted() {
  },
  methods: {
    date_format,
    clear() {
      this.search_content = "";
      this.date_range = null;
    }
  },
  computed: {
    filteredImages() {
      const searchContent = this.search_content;
      const dateRange = this.date_range;

      return this.images.filter(image => {
        const idMatch = image.id === searchContent || !searchContent;
        const dateMatch = !dateRange || new Date(image.time) >= dateRange[0] && new Date(image.time) <= dateRange[1];

        return idMatch && dateMatch;
      });
    }
  },
};
</script>

<template>
  <div class="w-full h-full flex flex-col overflow-y-hidden">
    <div class="h-[10%] w-full"></div>
    <div class="w-full h-[90%] flex flex-row">
      <div class="w-full h-full flex flex-col p-[20px]">
        <div class="mb-[20px] flex flex-row items-center justify-around">
          <div class="flex flex-row items-center">
            <div class="mx-[5px]">搜索图片</div>
            <div class="w-[240px] mx-[5px]">
              <el-input v-model="search_content" placeholder="请输入图片id"/>
            </div>
          </div>
          <div class="flex flex-row items-center">
            <div class="mx-[5px]">筛选日期</div>
            <div class="w-[300px] mx-[5px]">
              <el-date-picker v-model="date_range"
                              end-placeholder="结束日期"
                              range-separator="到"
                              start-placeholder="开始日期"
                              style="width: 100%"
                              type="daterange"
              />
            </div>
          </div>
          <div class="flex flex-row items-center">
            <el-button @click="clear">重置</el-button>
          </div>
        </div>
        <div class="grid gap-x-4 gap-y-[20px] grid-cols-4 auto-rows-auto overflow-y-scroll">
          <div v-for="image in filteredImages"
               :key="image.id"
               class="shadow-md pb-[2px] flex flex-col justify-between">
            <div>
              <el-image :src="image.imgUrl" class="w-full h-full" fit="cover"/>
            </div>
            <div>
              <div class="px-[10px] py-[2px]">id：{{ image.id }}</div>
              <div class="px-[10px] py-[2px]">
                日期：{{ date_format(new Date(image.time)) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
