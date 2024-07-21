<script>
import {call_api} from "../../utils/cloud";
import {ElNotification} from "element-plus";

export default {
  data(){
    return{
      images: [],
      image: null,
      search_content: "",
      date_range: null,
      hasMore: true,
      pages: 0,
    }
  },
  computed: {
    filteredImages() {
      const searchContent = this.search_content;
      const re = new RegExp(searchContent, 'i');
      const dateRange = this.date_range;

      return this.images.filter(image => {
        const nameMatch = re.test(image.name) || !searchContent;
        const dateMatch = !dateRange || new Date(image.time) >= dateRange[0] && new Date(image.time) <= dateRange[1];

        return nameMatch && dateMatch;
      });
    }
  },
  async mounted() {
    await this.get_image();
  },
  methods:{
    async get_image() {
      this.pages += 1;
      let start_time = 1577808000000;
      if (this.pages !== 1) {
        start_time = this.images[this.images.length - 1].create_at;
      }
      console.log(start_time);
      let res = await call_api("album/get_images",{
        folder_id: this.$route.params.id,
        start_time: start_time,
        image_number: 20
      })
      console.log(res);
      if(!res.success){
        ElNotification({
          title: 'Error',
          type: "error",
          message: `获取图片失败`
        });
        this.pages -= 1;
        console.log(res);

        return
      }
      this.hasMore = res.data.images_info.length === 20;
      console.log(`第${this.pages}页数据已加载`);
      this.images = this.images.concat(res.data.images_info);
    },
    clear() {
      this.search_content = "";
      this.date_range = null;
    },
    showDialog() {

    }
  }
}
</script>

<template>
  <div class="h-full w-full flex flex-col justify-center items-center bg-[#F8FAFD]">

    <div class="h-[5vh] w-full mb-[20px] flex flex-row items-center justify-around">
      <div class="flex flex-row items-center">
        <div class="mx-[5px]">搜索图片</div>
        <div class="w-[240px] mx-[5px]">
          <el-input v-model="search_content" placeholder="请输入图片名称"/>
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
      <div class="h-[85vh] w-[90vw]">
        <el-scrollbar>
          <div v-if="filteredImages.length > 0" v-infinite-scroll="get_image" :infinite-scroll-disabled=!hasMore infinite-scroll-delay=1000
               class="grid grid-cols-4 gap-[20px]">
            <div v-for="image in filteredImages"
                 :key="image.id"
                 @click="showDialog"
                 class="shadow-md pb-[2px] flex flex-col justify-between">
                <div @click="console.log(image)">
                  <el-image :src="image.temp_url" class="w-full h-auto" fit="cover"/>
                </div>
                <div>
                  <div class="px-[10px] py-[2px]">图片：{{ image.name }}</div>
                  <div class="px-[10px] py-[2px]">id：{{ image.id }}</div>
                </div>
            </div>
          </div>
          <div v-else class="w-full h-[85vh] flex flex-row items-center justify-center">
            <span class="font-['RGBZ'] text-[40px]">当前相册没有图片</span>
          </div>
        </el-scrollbar>
      </div>


  </div>
</template>

<style scoped>

</style>