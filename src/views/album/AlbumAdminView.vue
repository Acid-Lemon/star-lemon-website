<script>
import {call_api} from "@/src/utils/cloud";
import {ElNotification} from "element-plus";
import {Picture} from "@element-plus/icons-vue";

export default {
  name: "ImageView",
  components:{Picture},
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
      photoAlbumName: "",
      photoAlbums: [

      ],
      photoAlbum: "",
      hasPhotoAlbums: true,
      activeName: "shared",
      disabled: false,
    };
  },
  async mounted() {
    await this.get_folders()
  },
  methods: {
    async get_folders() {
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

      this.hasPhotoAlbums = this.photoAlbums.length !== 0;
    },
    async createNewPhotoAlbum(){
      let res = await call_api("album/create_folder", {
        folder_name: this.photoAlbumName,
        public_state: this.activeName
      });

      if(!res.success){
        ElNotification({
          title: 'Error',
          type: "error",
          message: res
        });

        return;
      }

      this.photoAlbums.push({
        name: this.photoAlbumName,
        id: res.data.folder_id,
        value: this.activeName,
      });
      this.photoAlbumName = "";
      this.photoAlbum = this.photoAlbums[this.photoAlbums.length - 1];

      ElNotification({
        title: 'Success',
        type: "success",
        message: "创建成功"
      });
    },
  },
};
</script>

<template>
  <div class="w-full h-full flex flex-col items-center overflow-y-hidden bg-[#F8FAFD]">
    <div class="h-[95vh] w-[90vw]">
      <el-tabs v-model="activeName" class="demo-tabs" @tab-change="get_folders">
        <el-tab-pane label="共享相册" name="shared">
          <div class="h-[95vh]">
            <div class="flex flex-row items-center mb-[20px]">
              <el-input v-model="photoAlbumName" style="width: 240px;margin-right: 20px" placeholder="相册名"></el-input>
              <el-button type="primary" @click="createNewPhotoAlbum()" :disabled="disabled">新建相册</el-button>
            </div>
            <el-scrollbar>
              <div v-if="hasPhotoAlbums"
                   class="md:columns-5 columns-2 column-gap-[20px]">
                <div v-for="photoAlbum in photoAlbums"
                     :key="photoAlbum.id"
                     class="shadow-md break-inside-avoid mb-[20px]">
                  <router-link :to="'/admin/album/' + photoAlbum.name + '?album_id=' + photoAlbum.id">
                    <div>
                      <el-image src=""  class="w-full h-[20vh]" fit="cover">
                        <template #error>
                          <div class="image-slot">
                            <el-icon style="width:100%; height:20vh"><Picture style="width: 50px;height:50px"/></el-icon>
                          </div>
                        </template>
                      </el-image>
                    </div>
                    <div>
                      <div class="text-[14px] px-[10px] py-[2px] whitespace-normal break-all">相册名：{{ photoAlbum.name }}</div>
                      <div class="text-[14px] px-[10px] py-[2px] whitespace-normal break-all">id：{{ photoAlbum.id }}</div>
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
          <div class="h-[95vh]">
            <div class="flex flex-row items-center mb-[20px]">
              <el-input v-model="photoAlbumName" style="width: 240px;margin-right: 20px" placeholder="相册名"></el-input>
              <el-button type="primary" @click="createNewPhotoAlbum()" :disabled="disabled">新建相册</el-button>
            </div>
            <el-scrollbar>
              <div v-if="hasPhotoAlbums"
                   class="md:columns-5 columns-2 column-gap-[20px]">
                <div v-for="photoAlbum in photoAlbums"
                     :key="photoAlbum.id"
                     class="shadow-md break-inside-avoid mb-[20px]">
                  <router-link :to="'/admin/album/' + photoAlbum.name + '?album_id=' + photoAlbum.id">
                    <div>
                      <el-image src=""  class="w-full h-[20vh]" fit="cover">
                        <template #error>
                          <div class="image-slot">
                            <el-icon style="width:100%; height:20vh"><Picture style="width: 50px;height:50px"/></el-icon>
                          </div>
                        </template>
                      </el-image>
                    </div>
                    <div>
                      <div class="text-[14px] px-[10px] py-[2px] whitespace-normal break-all">相册名：{{ photoAlbum.name }}</div>
                      <div class="text-[14px] px-[10px] py-[2px] whitespace-normal break-all">id：{{ photoAlbum.id }}</div>
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
          <div class="h-[95vh]">
            <div class="flex flex-row items-center mb-[20px]">
              <el-input v-model="photoAlbumName" style="width: 240px;margin-right: 20px" placeholder="相册名"></el-input>
              <el-button type="primary" @click="createNewPhotoAlbum()" :disabled="disabled">新建相册</el-button>
            </div>
            <el-scrollbar>
              <div v-if="hasPhotoAlbums"
                   class="md:columns-5 columns-2 column-gap-[20px]">
                <div v-for="photoAlbum in photoAlbums"
                     :key="photoAlbum.id"
                     class="shadow-md break-inside-avoid mb-[20px]">
                  <router-link :to="'/admin/album/' + photoAlbum.name + '?album_id=' + photoAlbum.id">
                    <div>
                      <el-image src=""  class="w-full h-[20vh]" fit="cover">
                        <template #error>
                          <div class="image-slot">
                            <el-icon style="width:100%; height:20vh"><Picture style="width: 50px;height:50px"/></el-icon>
                          </div>
                        </template>
                      </el-image>
                    </div>
                    <div>
                      <div class="text-[14px] px-[10px] py-[2px] whitespace-normal break-all">相册名：{{ photoAlbum.name }}</div>
                      <div class="text-[14px] px-[10px] py-[2px] whitespace-normal break-all">id：{{ photoAlbum.id }}</div>
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
