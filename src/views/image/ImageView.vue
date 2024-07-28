<script>
import {call_api} from "../../utils/cloud";
import {ElNotification} from "element-plus";
import {ArrowLeft} from "@element-plus/icons-vue";

export default {
  components: {ArrowLeft},
  data(){
    return{
      images: [],
      image: null,
      search_content: "",
      date_range: null,
      hasMore: true,
      loadingMore: false,
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
    },
    state() {
      return !this.hasMore || this.loadingMore
    }
  },
  async mounted() {
    await this.get_images();
  },
  methods:{
    async get_images() {
      this.loadingMore = true;
      this.pages += 1;
      console.log(`开始加载第${this.pages}页数据`);
      let start_time = new Date().getTime();
      let skip_number = 0;
      if (this.pages !== 1) {
        start_time = this.images[this.images.length - 1].create_at;
        skip_number = this.skip_number();
      }
      console.log(start_time);
      let res = await call_api("album/get_images",{
        folder_id: this.$route.params.id,
        time_range: {
          from_time: start_time,
          to_time: 0
        },
        image_number: 20,
        skip_number
      })
      console.log(res);
      if(!res.success){
        ElNotification({
          title: 'Error',
          type: "error",
          message: `获取图片失败`
        });
        this.pages -= 1;
        this.loadingMore = false;
        console.log(res);

        return
      }
      console.log(`第${this.pages}页数据已加载`);
      this.images = this.images.concat(res.data.images_info);

      this.hasMore = res.data.images_info.length === 20;
      this.loadingMore = false;
    },
    clear() {
      this.search_content = "";
      this.date_range = null;
    },
    skip_number() {
      let index = 1;
      while(this.images[this.images.length - index].create_at === this.images[this.images.length - index - 1].create_at) {
        index += 1;
      }
      return index;
    },
    onBack() {
      this.$router.back()
    },
    showDialog() {

    },
  }
}
</script>

<template>
  <div class="h-full w-full flex flex-col justify-start items-center bg-[#F8FAFD]">
    <div class="fixed top-0 left-0 w-full h-[6vh] p-[10px] z-[1000] flex flex-row items-center">
      <div @click="onBack" class="flex flex-row items-center text-[#000000] font-['RGBZ']">
        <el-icon style="width: 25px; height: 25px"><arrow-left style="width: 25px; height: 25px" /></el-icon>
        返回
      </div>
      <div class="w-[1px] h-[80%] border border-[#000000] mx-[10px]"></div>
      <div class="text-[2vh] text-[#000000] font-['RGBZ']">图片</div>
    </div>
    <div class="w-full h-[5vh]"></div>
    <div class="bg-[url('/static/background/17.jpg')] bg-cover rounded-md h-[6vh] w-[95vw] flex flex-col items-center justify-center p-[20px]">
      <div class="h-[5vh] w-full flex flex-row items-center justify-between">
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
    </div>
      <div class="h-[82vh] w-[95vw] my-[2vh]">
        <el-scrollbar>
          <div v-if="filteredImages.length > 0" v-infinite-scroll="get_images" :infinite-scroll-disabled="state" infinite-scroll-delay=1000 infinite-scroll-distance=100
               class="md:columns-5 columns-2 column-gap-[20px]">
            <div v-for="image in filteredImages"
                 :key="image.id"
                 @click="showDialog"
                 class="shadow-md break-inside-avoid mb-[20px]">
                <div @click="console.log(image)">
                  <el-image :src="image.temp_url" class="w-full h-auto" fit="cover"/>
                </div>
                <div>
                  <div class="text-[14px] px-[10px] py-[2px] whitespace-normal break-all">图片：{{ image.name }}</div>
                  <div class="text-[14px] px-[10px] py-[2px] whitespace-normal break-all">id：{{ image.id }}</div>
                </div>
            </div>
          </div>
          <div v-else class="w-full h-[85vh] flex flex-row items-center justify-center">
            <div class="font-['RGBZ'] text-[40px]">当前相册没有图片</div>
          </div>
          <div v-if="loadingMore" class="w-full h-[20vh] flex flex-row items-center justify-center">
            <div class="text-[3vh] font-['RGBZ']">正在加载中</div>
          </div>
          <div v-if="!hasMore" class="w-full h-[20vh] flex flex-row items-center justify-center">
            <div class="text-[3vh] font-['RGBZ']">没有更多图片惹</div>
          </div>
        </el-scrollbar>
      </div>
  </div>
</template>

<style scoped>

</style>