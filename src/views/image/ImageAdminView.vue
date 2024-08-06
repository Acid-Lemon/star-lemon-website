<script>
import {ElAutoResizer, ElNotification} from 'element-plus';
import { UploadFilled, ArrowLeft } from '@element-plus/icons-vue'
import {call_api} from "@/src/utils/cloud";

export default {
  name: "ImageAdminView",
  components: {ElAutoResizer,UploadFilled, ArrowLeft},
  data() {
    return {
      photo_albums: [],
      photo_album: null,
      photo_albums_types: [
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
      photo_albums_type: {
        value: 'private',
        label: '私密相册'
      },
      devices: [
        { value: 'Redmi K60 Ultra', label: '红米 K60 至尊版' },
        { value: 'EOS 500D', label: '佳能 500D' },
        { value: 'CCD', label: 'CCD' },
      ],
      device: { value: 'EOS 500D', label: '佳能 500D' },
      photo_album_name: "",
      image_list: [],
      photo_list: [],
      upload_url: "",
      data:{},
      images: [],
      disabled: false,
      index: 0,
      pages: 0,
      current_page: 1,
      date: null
    }
  },
  async mounted() {
    await this.get_images();
  },
  methods: {
    async get_images() {
      this.pages += 1;
      console.log(`开始加载第${this.pages}页数据`);
      let start_time = new Date().getTime();
      let skip_number = 0;
      if (this.pages !== 1) {
        start_time = this.images[this.pages - 2][this.images[this.pages - 2].length - 1].create_at;
        skip_number = this.skip_number();
      }
      let res = await call_api("album/get_images", {
        folder_id: this.$route.query.album_id,
        time_range: {
          from_time: start_time,
          to_time: 0
        },
        image_number: 20,
        skip_number
      })
      if(!res.success){
        if(res.code === "err_no_folder") {
          this.$router.push('/404');
          return
        }
        ElNotification({
          title: 'Error',
          type: "error",
          message: `获取图片失败`
        });
        this.pages -= 1;
        console.log(res);

        return
      }

      this.images = this.images.concat([res.data.images_info]);
    },
    upload() {
      console.log("开始");
      this.disabled = true;
      this.photo_list = this.image_list;
      this.uploadImage();
    },
    async uploadImage(){
      if (this.index >= this.photo_list.length) {
        this.photo_list = [];
        this.image_list = [];
        this.index = 0;
        this.disabled = false;
        return;
      }

      this.image_list = [];
      this.image_list.push(this.photo_list[this.index]);

      let res = await call_api("album/create_image", {
        folder_id: this.$route.query.album_id,
        image_name: this.image_list[0].name
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

      this.upload_url = res.data.upload_file_options.url;
      this.data = res.data.upload_file_options.formData;

      this.$refs.upload.submit();
    },
    async on_success() {
      ElNotification({
        title: 'Success',
        type: "success",
        message: `第${this.index + 1}张上传成功`
      });
      this.index ++;
      await this.uploadImage();
    },
    async on_error() {
      ElNotification({
        title: 'Error',
        type: "error",
        message: `第${this.index + 1}张上传失败`
      });
      this.index ++;
      await this.uploadImage();
    },
    handle_delete(index, row){
      console.log("删除")
    },
    async change() {
      if(this.pages + 1 === this.current_page) {
        await this.get_images()
      }

    },
    page_count() {
      return this.images[this.pages - 1]?.length === 20 ? this.pages + 1 : this.pages
    },
    skip_number() {
      let index = 1;
      while(this.images[this.pages - 2][this.images[this.pages - 2].length - index].create_at === this.images[this.pages - 2][this.images[this.pages - 2].length - index - 1].create_at) {
        index += 1;
      }
      return index;
    },
    on_back() {
      if(window.history.length > 1) {
        this.$router.back()
      } else {
        this.$router.push('/admin/album');
      }
    },
  }
}
</script>

<template>
  <div class="w-full h-full bg-[#F8FAFD] flex flex-col content-center items-center">
    <div class="fixed top-0 left-0 w-full h-[6vh] p-[10px] z-[1000] flex flex-row items-center">
      <div @click="on_back" class="flex flex-row items-center text-[#000000] font-['RGBZ']">
        <el-icon style="width: 25px; height: 25px"><arrow-left style="width: 25px; height: 25px" /></el-icon>
        返回
      </div>
      <div class="w-[1px] h-[80%] border border-[#000000] mx-[10px]"></div>
      <div class="text-[2vh] text-[#000000] font-['RGBZ']">{{ this.$route.params.album_name }}</div>
    </div>
    <div class="w-full h-[5vh]"></div>
      <div class="bg-[url('/static/background/17.jpg')] bg-cover rounded-md w-[95vw] h-[15vh] flex flex-col items-start justify-between p-[20px]">
        <div class="w-full flex flex-row justify-between items-center">
          <div class="flex flex-row justify-center items-center">
            <div>图片名称：</div>
            <el-input style="width: 10vw; height: 30px"></el-input>
          </div>
          <div class="flex flex-row justify-center items-center">
            <div>拍摄时间：</div>
            <el-date-picker v-model="date"
                            style="width: 10vw; height: 30px"
                            type="date"
            />
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
        </div>
        <div class="w-full flex flex-row justify-between items-center">
          <div class="flex flex-row justify-center items-center">
            <el-upload
                v-model:file-list="image_list"
                ref="upload"
                :multiple = true
                :auto-upload = false
                :show-file-list = false
                style="margin-right: 20px"
                :action = "upload_url"
                :data = "data"
                :on-success="on_success"
                :on-error="on_error"
            >
              <el-button type="primary" :disabled="disabled">选择图片</el-button>
            </el-upload>
            <div class="mr-[20px]" @click="console.log(this.image_list)">已选择{{ image_list.length }}张照片</div>
            <el-button @click="this.image_list = []" :disabled="disabled" style="margin-right: 100px">清除</el-button>
          </div>
          <el-button type="primary" @click="upload" :disabled="disabled">上传</el-button>
        </div>
      </div>
    <div class="w-[95%] my-[2vh]">
      <el-table :data="images[current_page - 1]" border max-height="70vh" style="width: 100%">
        <el-table-column type="index" width="50"/>
        <el-table-column label="图片名称" prop="name" width="150"/>
        <el-table-column label="图片id" prop="id" width="250"/>
        <el-table-column label="下载链接" prop="temp_url"/>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button
                size="small"
                type="danger"
                @click="handle_delete(scope.$index, scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination layout="prev, pager, next" v-model:current-page="current_page" :page-count="pageCount()" @change="change()" />
    </div>
  </div>
</template>

<style scoped>

</style>
