<script>
import {ElAutoResizer} from 'element-plus';

export default {
  name: "ImageAdminView",
  components: {ElAutoResizer},
  data() {
    return {
      images: [],
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
    // 获取上传状态
    select(e) {
      console.log('选择文件：', e)
    },
    // 获取上传进度
    progress(e) {
      console.log('上传进度：', e)
    },

    // 上传成功
    success(e) {
      console.log('上传成功')
    },

    // 上传失败
    fail(e) {
      console.log('上传失败：', e)
    },
  }
};
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
        <uni-file-picker ref="files" :auto-upload="false" fileMediatype="image" mode="list"
                         @fail="fail"
                         @progress="progress"
                         @select="select" @success="success"/>
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
