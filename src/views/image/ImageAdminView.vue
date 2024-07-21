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
      devices: [
        { value: 'Redmi K60 Ultra', label: '红米 K60 至尊版' },
        { value: 'Redmi K60', label: '红米 K60' },
      ],
      device: { value: 'Redmi K60 Ultra', label: '红米 K60 至尊版' },
      photoAlbumName: "",
      imageList: [],
      photoList: [],
      uploadUrl: "",
      data:{},
      images: [],
      disabled: false,
      index: 0,
    }
  },
  async mounted() {
    let res = await call_api("album/get_images", {
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

    console.log(res);
    this.images = res.data.images_info;
  },
  methods: {
    upload() {
      console.log("开始");
      this.disabled = true;
      this.photoList = this.imageList;
      this.uploadImage();
    },
    async uploadImage(){
      if (this.index >= this.photoList.length) {
        this.photoList = [];
        this.imageList = [];
        this.index = 0;
        this.disabled = false;
        return;
      }

      this.imageList = [];
      this.imageList.push(this.photoList[this.index]);

      let res = await call_api("album/create_image", {
        folder_id: this.$route.params.id,
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
    handleDelete(index, row){
      console.log("删除")
    }
  }
}
</script>

<template>
  <div class="w-full h-[95vh] bg-[#F8FAFD] flex flex-col content-center items-center">
    <div class="w-[95%] my-[20px]">
      <div class="h-[3vh]"></div>
      <div class="bg-[url('/static/background/17.jpg')] bg-cover rounded-md h-[30vh] flex flex-col items-start justify-between p-[20px]">
        <div class="w-full flex flex-row justify-between items-center">
          <div class="flex flex-row justify-center items-center">
            <div>图片名称：</div>
            <el-input style="width: 10vw; height: 30px"></el-input>
          </div>
          <div class="flex flex-row justify-center items-center">
            <div>拍摄地点：</div>
            <el-input style="width: 10vw; height: 30px"></el-input>
          </div>
          <div class="flex flex-row justify-center items-center">
            <div>拍摄设备：</div>
            <el-select
                v-model="device"
                style="width: 10vw; height: 30px"
            >
              <el-option
                  v-for="device in devices"
                  :key="device.value"
                  :label="device.label"
                  :value="device.value"
              />
            </el-select>
          </div>
          <div class="flex flex-row justify-center items-center">
            <div>描述：</div>
            <el-input style="width: 30vw; height: 30px"></el-input>
          </div>
        </div>
        <div class="w-full flex flex-row justify-between items-center">
          <div class="flex flex-row justify-center items-center">
            <div>描述：</div>
            <el-input style="width: 30vw; height: 30px"></el-input>
          </div>
        </div>
        <div class="w-full flex flex-row justify-between items-center">
          <div class="flex flex-row justify-center items-center">
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
            <div class="mr-[20px]" @click="console.log(this.imageList)">已选择{{ imageList.length }}张照片</div>
            <el-button @click="this.imageList = []" :disabled="disabled" style="margin-right: 100px">清除</el-button>
          </div>
          <el-button type="primary" @click="upload" :disabled="disabled">上传</el-button>
        </div>
      </div>
    </div>
    <div class="w-[95%] my-[20px]">
      <el-table :data="images" border style="width: 100%">
        <el-table-column label="图片名称" prop="name" width="150"/>
        <el-table-column label="图片id" prop="id" width="250"/>
        <el-table-column label="下载链接" prop="temp_url"/>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button
                size="small"
                type="danger"
                @click="handleDelete(scope.$index, scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>

</style>
