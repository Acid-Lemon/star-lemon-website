<script>
  export default {
    data() {
      return {
        tableData: [
          {
            id: '1',
            dateTime: 10000000,
            photoAlbum: "相册3",
            uploadUsername: "lemon",
            downloadLink: "https://xxxxx/xxx/"
          },
          {
            id: '2',
            dateTime: 10000000,
            photoAlbum: "相册2",
            uploadUsername: "lemon",
            downloadLink: "https://xxxxx/xxx/"
          },
          {
            id: '3',
            dateTime: 10000000,
            photoAlbum: "相册1",
            uploadUsername: "star",
            downloadLink: "https://xxxxx/xxx/"
          },
        ],
      }
    }
  }
</script>

<template>
  <div class="w-full h-full bg-[#F8FAFD] flex flex-col content-center items-center">
    <div class="w-[95%] my-[20px]">
      <div class="flex flex-row items-center justify-around">

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