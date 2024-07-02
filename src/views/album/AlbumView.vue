<script>
import {call_api} from "@/src/utils/cloud";
import {date_format} from "@/src/utils/time";
import {ElNotification} from "element-plus";

export default {
  name: "ImageView",
  data() {
    return {
      images: [
      ],
      photoAlbumsTypes: [
        {
          value: 'shared',
          label: '共享相册'
        },
        {
          value: 'public',
          label: '公开相册'
        },
        {
          value: 'private',
          label: '私密相册'
        },
      ],
      photoAlbums: [

      ],
      photoAlbum: "",
      activeName: "shared",
    };
  },
  async mounted() {
    await this.handleClick()
  },
  methods: {
    async handleClick() {
      this.photoAlbums = [];

      let res = await call_api("album/get_folders", {
        public_state: this.activeName
      });
      if (!res.success) {
        ElNotification({
          title: 'Error',
          type: "error",
          message: `获取相册失败`
        });
        console.log(res);

        return;
      }
      this.photoAlbums = res.data.folders_info;
    },
  },
};
</script>

<template>
  <div class="w-full h-full flex flex-col items-center overflow-y-hidden bg-[#F8FAFD]">
    <div class="h-[10vh] w-full"></div>
    <div class="h-[90vh] w-[90vw]">
      <el-tabs v-model="activeName" class="demo-tabs" @tab-change="handleClick">
        <el-tab-pane label="共享相册" name="shared">
          <div class="h-[85vh]">
          <el-scrollbar>
            <div v-if="photoAlbums.length > 0"
                 class="grid grid-flow-row grid-cols-4 gap-[20px]">
              <div v-for="photoAlbum in photoAlbums"
                   :key="photoAlbum.id"
                   class="shadow-md pb-[2px] flex flex-col justify-between">
                <router-link :to="'/album/' + photoAlbum.id">
                <div>
                  <el-image src="" class="w-full h-[20vh]" fit="cover"/>
                </div>
                <div>
                  <div class="px-[10px] py-[2px]">相册名：{{ photoAlbum.name }}</div>
                  <div class="px-[10px] py-[2px]">id：{{ photoAlbum.id }}</div>
                </div>
                  </router-link>
              </div>
            </div>
            <div v-else class="w-full h-[85vh] flex flex-row items-center justify-center">
              <span class="font-['RGBZ'] text-[40px]">当前分类没有相册</span>
            </div>
          </el-scrollbar>
          </div>
        </el-tab-pane>
        <el-tab-pane label="公共相册" name="public">
          <div class="h-[85vh]">
          <el-scrollbar>
            <div v-if="photoAlbums.length > 0"
                 class="grid grid-flow-row grid-cols-4 gap-[20px]">
              <div v-for="photoAlbum in photoAlbums"
                   :key="photoAlbum.id"
                   class="shadow-md pb-[2px] flex flex-col justify-between">
                <router-link :to="'/album/' + photoAlbum.id">
                  <div>
                    <el-image src="" class="w-full h-[20vh]" fit="cover"/>
                  </div>
                  <div>
                    <div class="px-[10px] py-[2px]">相册名：{{ photoAlbum.name }}</div>
                    <div class="px-[10px] py-[2px]">id：{{ photoAlbum.id }}</div>
                  </div>
                </router-link>
              </div>
            </div>
            <div v-else class="w-full h-[85vh] flex flex-row items-center justify-center">
              <span class="font-['RGBZ'] text-[40px]">当前分类没有相册</span>
            </div>
          </el-scrollbar>
          </div>
        </el-tab-pane>
        <el-tab-pane label="私密相册" name="private">
          <div class="h-[85vh]">
          <el-scrollbar>
            <div v-if="photoAlbums.length > 0"
                 class="grid grid-flow-row grid-cols-4 gap-[20px]">
              <div v-for="photoAlbum in photoAlbums"
                   :key="photoAlbum.id"
                   class="shadow-md pb-[2px] flex flex-col">
                <router-link :to="'/album/' + photoAlbum.id">
                <div>
                  <el-image src="" class="w-full h-[20vh]" fit="cover"/>
                </div>
                <div>
                  <div class="px-[10px] py-[2px]">相册名：{{ photoAlbum.name }}</div>
                  <div class="px-[10px] py-[2px]">id：{{ photoAlbum.id }}</div>
                </div>
                </router-link>
              </div>
            </div>
            <div v-else class="w-full h-[85vh] flex flex-row items-center justify-center">
              <span class="font-['RGBZ'] text-[40px]">当前分类没有相册</span>
            </div>
          </el-scrollbar>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style scoped>

</style>
