<script>
  import {
    ElMessage,
    ElMessageBox
  } from "element-plus";

  export default {
    data() {
      return {
        dialogVisible: false,
        date: null,
        username: null,
        motto: null,
        fileList: null,
        avatar: [],
        background: []
      };
    },
    methods: {
      handleClose(done) {
        ElMessageBox.confirm('确认关闭？（未提交的信息不会保存）', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            done();
          })
          .catch(() => {});
      },
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
      }
    },
  }
</script>

<template>
  <div class="h-full w-full">
    <div class="bg-[url('/static/background/12.jpg')] bg-cover h-[40%] relative">
      <div class="absolute bottom-[-5vh] left-[10vw] flex flex-row items-end">
        <img src="/static/favicon/favicon.png" class="h-[10vh] w-[10vh] rounded-full mr-[10px]" />
        <p class="font-['SYST'] text-[24px] mr-[20px] leading-none pb-[5px]">Lemon</p>
        <p class="font-['SYST'] text-[18px] mr-[10px] leading-none pb-[5px]">ID：552545</p>
        <div
          class="bg-[#36BDB4] rounded-md mb-[3px] mr-[20px] text-[12px] h-[20px] w-[50px] flex flex-row justify-center items-center">
          管理员
        </div>
        <p class="font-['SYST'] text-[14px] mr-[20px] leading-none pb-[5px]">生日：2006年3月1日</p>
        <p class="font-['SYST'] text-[14px] opacity-50 leading-none pb-[5px]">Hi！希望你开心～</p>
      </div>
      <el-button class="absolute bottom-[-5vh] right-[10vw]" plain @click="dialogVisible = true">
        编辑信息
      </el-button>
      <el-dialog title="编辑个人信息" v-model="dialogVisible" center :before-close="handleClose"
        class="flex flex-col items-center justify-center h-[400px]" width="60%">
        <div class="w-full flex flex-row items-center justify-center">
          <div class="w-[50%] my-[5px]">
            <span>头像：</span>
            <uni-file-picker :limit="1" v-model="avatar" fileMediatype="image" mode="grid" @select="select" @progress="progress"
              @success="success" @fail="fail" />
          </div>
          <div class="w-[50%] my-[5px]">
            <span>个人背景：</span>
            <uni-file-picker :limit="1" v-model="background" fileMediatype="image" mode="grid" @select="select"
              @progress="progress" @success="success" @fail="fail" />
          </div>
        </div>
        <div class="w-full flex flex-row items-center justify-between">
          <div class="w-[30%] my-[5px]">
            <span>用户名：</span>
            <el-input v-model="username" class="w-full" />
          </div>
          <div class="w-[30%] my-[5px]">
            <span>生日：</span>
              <el-date-picker v-model="date" type="date" size="default" style="width: 100%" />
          </div>
          <div class="w-[30%] my-[5px]">
            <span>个性签名：</span>
            <el-input v-model="motto" class="w-full" />
          </div>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogVisible = false" class="mx-[40px]">取消</el-button>
            <el-button type="primary" @click="dialogVisible = false" class="mx-[40px]">确定</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>
<style scoped>
  .so {
    width: 100%;
  }
</style>