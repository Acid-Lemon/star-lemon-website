<script>
  export default {
    data() {
      return {
        dialogVisible: false,
        date: null,
        username:null,
        motto:null
        
      };
    },
    methods: {
      handleClose(done) {
        this.$confirm('确认关闭？(未提交内容不会保存)')
          .then(() => {
            done();
          })
          .catch(() => {
          });
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
      <el-button
        class="absolute bottom-[-5vh] right-[10vw]" plain @click="dialogVisible = true">
        编辑信息
      </el-button>
      <el-dialog title="编辑个人信息" v-model="dialogVisible" width="30%" center :before-close="handleClose">
        <div class="flex flex-col justify-between items-start h-[180px] w-[80%]">
        <div class="w-full">
          <span>用户名：</span>
          <el-input v-model="username" class="w-full" />
        </div>
        <div class="w-full">
        <span>生日：</span>
        <div class="w-full">
        <el-date-picker
          v-model="date"
          type="date"
          size="default"
        />
        </div>
        </div>
        <div class="w-full">
        <span>个性签名：</span>
        <el-input v-model="motto" class="w-full" />
        </div>
        </div>
        <template #footer>
        <div class="dialog-footer flex flex-row justify-around">
          <el-button type="primary" @click="dialogVisible = false">确定</el-button>
          <el-button @click="dialogVisible = false">取消</el-button>
        </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>
<style scoped>
</style>