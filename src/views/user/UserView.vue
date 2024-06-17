<script>
import {ElMessageBox} from "element-plus";

export default {
  data() {
    return {
      dialogVisible: false,
      date: null,
      username: null,
      motto: null,
      fileList: null,
      avatar: [],
      avatarUrl: [
        '/static/avatar/1.jpg',
        '/static/avatar/2.jpg',
        '/static/avatar/3.jpg',
        '/static/avatar/4.jpg',
        '/static/avatar/5.jpg',
        '/static/avatar/6.jpg',
        '/static/avatar/7.jpg',
        '/static/avatar/8.jpg',
        '/static/avatar/9.jpg',
        '/static/avatar/10.jpg',
        '/static/avatar/11.jpg',
        '/static/avatar/12.jpg',
        '/static/avatar/13.jpg',
        '/static/avatar/14.jpg',
        '/static/avatar/15.jpg',
      ],
      avatarName: '',
      background: [],
      avatarStyles: {
        width: 128,
        height: 128,
        border: {
          color: "#000000",
          width: 2,
          style: 'dashed',
          radius: '2px'
        }
      },
      backgroundStyles: {
        width: 256,
        height: 128,
        border: {
          color: "#000000",
          width: 2,
          style: 'dashed',
          radius: '2px'
        }
      },
      clickFlag: -1,
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
          .catch(() => {
          });
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
    },
    choose(index) {
      this.clickFlag = index
    }
  },
}
</script>

<template>
  <div class="h-full w-full bg-[#F8FAFD]">
    <div class="bg-[url('/static/background/12.jpg')] bg-cover bg-center h-[40%] relative">
      <div class="absolute bottom-[-5vh] left-[10vw] flex flex-row items-end">
        <img alt="头像" class="h-[10vh] w-[10vh] rounded-full mr-[10px]" src="/static/favicon/favicon.png"/>
        <p class="font-['SYST'] text-[24px] mr-[20px] leading-none pb-[5px]">Lemon</p>
        <p class="font-['SYST'] text-[18px] mr-[10px] leading-none pb-[5px]">ID：552545</p>
        <el-tag class="font-['SYST'] text-[18px] mr-[10px] leading-none pb-[5px]" type="primary">管理员</el-tag>
        <p class="font-['SYST'] text-[14px] mr-[20px] leading-none pb-[5px]">生日：2006年3月1日</p>
        <p class="font-['SYST'] text-[14px] opacity-50 leading-none pb-[5px]">Hi！希望你开心～</p>
      </div>
      <el-button class="absolute bottom-[-5vh] right-[10vw]" plain @click="dialogVisible = true">
        编辑信息
      </el-button>
      <el-dialog v-model="dialogVisible" :before-close="handleClose" center
                 class="flex flex-col items-center justify-center h-[500px]"
                 title="编辑个人信息" width="60%">
        <div class="w-full flex flex-row items-center justify-center">
          <div class="w-[20%] my-[5px]">
            <span>头像：</span>
            <uni-file-picker v-model="avatar" :image-styles="avatarStyles" :limit="1" fileMediatype="image" mode="grid"
                             @fail="fail"
                             @progress="progress"
                             @select="select" @success="success"/>
          </div>
          <div class="w-[30%] my-[5px]">
            <span>个人背景：</span>
            <uni-file-picker v-model="background" :image-styles="backgroundStyles" :limit="1" fileMediatype="image"
                             mode="grid"
                             @fail="fail"
                             @progress="progress" @select="select" @success="success"/>
          </div>
          <div class="w-[50%] my-[5px]">
            <el-scrollbar height="250px">
              <div class="grid gap-x-4 gap-y-[20px] grid-cols-4 auto-rows-auto w-full h-full">
                <div v-for="(avatar,index) in avatarUrl" :key="avatar"
                     :class="{'border-[2px]':clickFlag === index,'border-[#08d9d6]':clickFlag === index}"
                     class="w-full shadow-md"
                     @click="choose(index)">
                  <el-image :src="avatar" class="w-full h-full" fit="cover"/>
                </div>
              </div>
            </el-scrollbar>
          </div>
        </div>
        <div class="w-full flex flex-row items-center justify-between">
          <div class="w-[20%] my-[5px]">
            <span>用户名：</span>
            <el-input v-model="username" class="w-full"/>
          </div>
          <div class="w-[20%] my-[5px]">
            <span>生日：</span>
            <el-date-picker v-model="date" size="default" style="width: 100%" type="date"/>
          </div>
          <div class="w-[50%] my-[5px]">
            <span>个性签名：</span>
            <el-input v-model="motto" class="w-full"/>
          </div>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button class="mx-[40px]" @click="dialogVisible = false">取消</el-button>
            <el-button class="mx-[40px]" type="primary" @click="dialogVisible = false">确定</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>
<style scoped>
</style>