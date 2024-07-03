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
    }
  },
  computed: {
    filteredImages() {
      const searchContent = Number(this.search_content);
      const dateRange = this.date_range;

      return this.images.filter(image => {
        const idMatch = image.id === searchContent || !searchContent;
        const dateMatch = !dateRange || new Date(image.time) >= dateRange[0] && new Date(image.time) <= dateRange[1];

        return idMatch && dateMatch;
      });
    }
  },
  async mounted() {
    let res = await call_api("album/get_images",{
      folder_id: this.$route.params.id,
      start_time: 1577808000000,
      image_number: 20
    })
    if(!res.success){
      ElNotification({
        title: 'Error',
        type: "error",
        message: `获取图片失败`
      });
      console.log(res);

      return
    }
    this.images = res.data.images_info;
    console.log(this.images)

  },
  methods:{
    clear() {
      this.search_content = "";
      this.date_range = null;
    }
  }
}
</script>

<template>
  <div class="h-full w-full flex flex-col justify-center items-center bg-[#F8FAFD]">

    <div class="h-[5vh] mb-[20px] flex flex-row items-center justify-around">
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
      <div class="h-[85vh] w-[90vw]">
        <el-scrollbar>
          <div v-if="filteredImages.length > 0"
               class="grid grid-flow-row grid-cols-4 gap-[20px]">
            <div v-for="image in filteredImages"
                 :key="image.id"
                 class="shadow-md pb-[2px] flex flex-col justify-between">
              <router-link :to="'/album/' + image.id">
                <div>
                  <el-image src="" class="w-full h-[20vh]" fit="cover"/>
                </div>
                <div>
                  <div class="px-[10px] py-[2px]">相册名：{{ image.name }}</div>
                  <div class="px-[10px] py-[2px]">id：{{ image.id }}</div>
                </div>
              </router-link>
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