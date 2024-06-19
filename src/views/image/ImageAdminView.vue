<script>
import {ElAutoResizer} from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue'

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
      tempFilePaths: [],
      tableData: [
        {id: '1', dateTime: 10000000, photoAlbum: "相册3", uploadUsername: "lemon", downloadLink: "https://xxxxx/xxx/"},
        {id: '2', dateTime: 10000000, photoAlbum: "相册2", uploadUsername: "lemon", downloadLink: "https://xxxxx/xxx/"},
        {id: '3', dateTime: 10000000, photoAlbum: "相册1", uploadUsername: "star", downloadLink: "https://xxxxx/xxx/"},
      ],
      photoAlbums: [
        "相册1",
        "相册2",
        "相册3",
      ],
      photoAlbum: "相册1",
    }
  },
  mounted() {

  },
  methods: {
    choose() {
      uni.chooseImage({
        sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album'], //从相册选择
        success:  (res) => {
          this.tempFilePaths = res.tempFilePaths;
        }
      });
    },
    upload() {
      uni.uploadFile({
        url: 'https://www.example.com/upload', //仅为示例，非真实的接口地址
        filePath: this.tempFilePaths[0],
        name: 'file',
        formData: {
          'user': 'test'
        },
        success: (uploadFileRes) => {
          console.log(uploadFileRes.data);
        }
      });
    }
  }
}
</script>

<template>
  <div class="w-full h-full bg-[#F8FAFD] flex flex-col content-center items-center">
    <div class="w-[95%] my-[20px]">
      <div class="flex flex-row items-center justify-around">
        <el-select
            v-model="photoAlbum"
            placeholder="Select"
            style="width: 240px"
        >
          <el-option
              v-for="photoAlbum in photoAlbums"
              :key="photoAlbum"
              :label="photoAlbum"
              :value="photoAlbum"
          />
        </el-select>
        <el-button @click="choose">选择图片</el-button>
        <div>已选择{{ tempFilePaths.length }}张照片</div>
        <el-button @click="this.tempFilePaths = []">清除</el-button>
        <el-button type="primary" :icon="UploadFilled" @click="upload">上传</el-button>
      </div>
    </div>
    <div class="w-[95%] my-[20px]">
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column label="图片id" prop="id" width="100"/>
        <el-table-column label="拍摄时间" prop="dateTime" width="200"/>
        <el-table-column label="相册" prop="photoAlbum" width="100"/>
        <el-table-column label="上传者" prop="uploadUsername" width="200"/>
        <el-table-column label="下载链接" prop="downloadLink"/>
      </el-table>
    </div>
  </div>
</template>

<style scoped>

</style>
