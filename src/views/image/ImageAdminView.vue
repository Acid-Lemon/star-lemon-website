<script>
import {ElAutoResizer, ElNotification} from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue'
import {call_api} from "@/src/utils/cloud";

export default {
  name: "ImageAdminView",
  computed: {
    UploadFilled() {
      return UploadFilled
    },
  },
  components: {ElAutoResizer,UploadFilled},
  data() {
    return {
      tableData: [
        {id: '1', dateTime: 10000000, photoAlbum: "相册3", uploadUsername: "lemon", uploadTime: 10000000, downloadLink: "https://xxxxx/xxx/"},
        {id: '2', dateTime: 10000000, photoAlbum: "相册2", uploadUsername: "lemon", uploadTime: 10000000, downloadLink: "https://xxxxx/xxx/"},
        {id: '3', dateTime: 10000000, photoAlbum: "相册1", uploadUsername: "star", uploadTime: 10000000, downloadLink: "https://xxxxx/xxx/"},
      ],
      photoAlbums: [],
      photoAlbum: null,
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
      photoAlbumsType: {
        value: 'private',
        label: '私密相册'
      },
      photoAlbumName: "",
      imageList: [],
      photo: [],
      uploadUrl: "",
      data:{},
      disabled: false,
      index: 0,
    }
  },
  async mounted() {
    let res = await call_api("album/get_folders", {
      public_state: "private"
    });
    if (!res.success) {
      ElNotification({
        title: 'Error',
        type: "error",
        message: `请求相册列表失败`
      });
      return;
    }
    this.photoAlbums = res.data.folders_info;
    this.photoAlbum = res.data.folders_info[0];
  },
  methods: {
    upload() {
      this.disabled = true;
      this.photo = this.imageList;
      this.uploadImage();
    },
    async uploadImage(){
      if (this.index >= this.photo.length) {
        this.photo = [];
        this.imageList = [];
        this.index = 0;
        this.disabled = false;
        return;
      }

      this.imageList = [];
      this.imageList.push(this.photo[this.index]);
      console.log(`第${this.index + 1}次请求`);
      let res = await call_api("album/create_image", {
        folder_id: this.photoAlbum.id,
        image_name: this.imageList[0].name
      });

      if (!res.success) {
        ElNotification({
          title: 'Error',
          type: "error",
          message: `第${this.index + 1}张请求上传失败`
        });
        console.log(res);

        this.index ++;
        await this.uploadImage();

        return;
      }

      this.uploadUrl = res.data.upload_file_options.url;
      this.data = res.data.upload_file_options.formData;

      this.$refs.upload.submit();
    },
    async onSuccess() {
      ElNotification({
        title: 'Success',
        type: "success",
        message: `第${this.index + 1}张上传成功`
      });
      this.index ++;
      await this.uploadImage();
    },
    async onError() {
      ElNotification({
        title: 'Error',
        type: "error",
        message: `第${this.index + 1}张上传失败`
      });
      this.index ++;
      await this.uploadImage();
    },
    async createNewPhotoAlbum(){
      let res = await call_api("album/create_folder", {
        folder_name: this.photoAlbumName,
        public_state: this.photoAlbumsType.value
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
        id: res.data.folder_id
      });
      this.photoAlbumName = "";
      this.photoAlbum = this.photoAlbums[this.photoAlbums.length - 1];

      ElNotification({
        title: 'Success',
        type: "success",
        message: "创建成功"
      });
    },
  }
}
</script>

<template>
  <div class="w-full h-full bg-[#F8FAFD] flex flex-col content-center items-center">
    <div class="w-[95%] my-[20px]">
      <div class="flex flex-row items-center justify-around">
        <div class="flex flex-row items-center">
        <el-select
            v-model="photoAlbum"
            placeholder="未选择"
            style="width: 240px"
        >
          <el-option
              v-for="photoAlbum in photoAlbums"
              :key="photoAlbum"
              :label="photoAlbum.name"
              :value="photoAlbum"
              :disabled="disabled"
          />
        </el-select>
        </div>
          <div class="flex flex-row items-center">
          <el-select
              v-model="photoAlbumsType"
              placeholder="Select"
              style="width: 120px;margin-right: 20px"
          >
            <el-option
                v-for="photoAlbumsType in photoAlbumsTypes"
                :key="photoAlbumsType"
                :label="photoAlbumsType.label"
                :value="photoAlbumsType"
                :disabled="disabled"
            />
          </el-select>
        <el-input v-model="photoAlbumName" style="width: 240px;margin-right: 20px" placeholder="相册名"></el-input>
          <el-button type="primary" @click="createNewPhotoAlbum()" :disabled="disabled">新建相册</el-button>
        </div>
        <div class="flex flex-row items-center">
        <el-upload
            v-model:file-list="imageList"
            ref="upload"
            :multiple = true
            :auto-upload = false
            :show-file-list = false
            style="margin-right: 20px"
            :action = "uploadUrl"
            :data = "data"
            :on-success="onSuccess"
            :on-error="onError"

        >
          <el-button type="primary" :disabled="disabled">选择图片</el-button>
        </el-upload>
        <div class="mr-[20px]">已选择{{ imageList.length }}张照片</div>
        <el-button @click="this.imageList = []" :disabled="disabled">清除</el-button>
        </div>
        <el-button type="primary" @click="upload" :disabled="disabled">上传</el-button>
      </div>
    </div>
    <div class="w-[95%] my-[20px]">
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column label="图片id" prop="id" width="100"/>
        <el-table-column label="拍摄时间" prop="dateTime" width="200"/>
        <el-table-column label="相册" prop="photoAlbum" width="100"/>
        <el-table-column label="上传者" prop="uploadUsername" width="200"/>
        <el-table-column label="上传时间" prop="uploadTime" width="200"/>
        <el-table-column label="下载链接" prop="downloadLink"/>
      </el-table>
    </div>
  </div>
</template>

<style scoped>

</style>
